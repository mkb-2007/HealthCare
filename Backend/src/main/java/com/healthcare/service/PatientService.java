package com.healthcare.service;

import com.healthcare.dto.ChangePasswordRequest;
import com.healthcare.dto.LoginRequest;
import com.healthcare.dto.PatientAdminDTO;
import com.healthcare.dto.PatientAdminUpdateRequest;
import com.healthcare.dto.PatientRegisterRequest;
import com.healthcare.dto.PatientUpdateRequest;
import com.healthcare.entity.Notification;
import com.healthcare.entity.Patient;
import com.healthcare.repository.AppointmentRepository;
import com.healthcare.repository.FavoriteRepository;
import com.healthcare.repository.NotificationRepository;
import com.healthcare.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import java.util.HashMap;
import java.util.Map;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final NotificationRepository notificationRepository;
    private final AppointmentRepository appointmentRepository;
    private final FavoriteRepository favoriteRepository;
    private final CloudinaryService cloudinaryService;

    @Autowired
    public PatientService(PatientRepository patientRepository,
                          NotificationRepository notificationRepository,
                          AppointmentRepository appointmentRepository,
                          FavoriteRepository favoriteRepository,
                          CloudinaryService cloudinaryService) {
        this.patientRepository = patientRepository;
        this.notificationRepository = notificationRepository;
        this.appointmentRepository = appointmentRepository;
        this.favoriteRepository = favoriteRepository;
        this.cloudinaryService = cloudinaryService;
    }

    // Register Patient
    public String registerPatient(PatientRegisterRequest request) {

        if (patientRepository.findByEmail(request.getEmail()).isPresent()) {
            return "Email already exists!";
        }

        Patient patient = new Patient();

        patient.setFullName(request.getFullName());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setPassword(request.getPassword());

        patientRepository.save(patient);

        return "Patient Registered Successfully";
    }

    // Login Patient
    public Patient login(LoginRequest request) {

        Patient patient = patientRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid Email or Password"
                    )
                );

        if (!patient.getPassword().equals(request.getPassword())) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid Email or Password"
            );
        }

        return patient;
    }

    public Patient updatePatient(Long id, PatientUpdateRequest request) {

        Patient patient = patientRepository.findById(id)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Patient not found"
                    )
                );

        patient.setFullName(request.getFullName());
        patient.setPhone(request.getPhone());
        patient.setGender(request.getGender());
        patient.setDateOfBirth(request.getDateOfBirth());

        patient.setBloodGroup(request.getBloodGroup());
        patient.setHeight(request.getHeight());
        patient.setWeight(request.getWeight());
        patient.setAllergies(request.getAllergies());
        patient.setChronicConditions(request.getChronicConditions());

        String oldEmergency = patient.getEmergencyContactName();
        String newEmergency = request.getEmergencyContactName();

        String oldInsurance = patient.getInsuranceProvider();
        String newInsurance = request.getInsuranceProvider();

        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
        patient.setEmergencyRelationship(request.getEmergencyRelationship());

        patient.setInsuranceProvider(request.getInsuranceProvider());
        patient.setPolicyNumber(request.getPolicyNumber());
        patient.setInsuranceValidUntil(request.getInsuranceValidUntil());

        Patient saved = patientRepository.save(patient);

        try {
            // General Profile Updated
            Notification nProfile = new Notification();
            nProfile.setUserId(saved.getId());
            nProfile.setTitle("Profile Updated");
            nProfile.setMessage("Your personal profile details have been updated successfully.");
            nProfile.setType("profile");
            notificationRepository.save(nProfile);

            // Emergency Contact Added or Removed
            if ((oldEmergency == null || oldEmergency.trim().isEmpty()) && newEmergency != null && !newEmergency.trim().isEmpty()) {
                Notification nEm = new Notification();
                nEm.setUserId(saved.getId());
                nEm.setTitle("Emergency Contact Added");
                nEm.setMessage(String.format("Emergency contact %s (%s) was added to your profile.", newEmergency, request.getEmergencyRelationship() != null ? request.getEmergencyRelationship() : "Contact"));
                nEm.setType("emergency");
                notificationRepository.save(nEm);
            } else if (oldEmergency != null && !oldEmergency.trim().isEmpty() && (newEmergency == null || newEmergency.trim().isEmpty())) {
                Notification nEm = new Notification();
                nEm.setUserId(saved.getId());
                nEm.setTitle("Emergency Contact Removed");
                nEm.setMessage("Your emergency contact was removed from your profile.");
                nEm.setType("emergency");
                notificationRepository.save(nEm);
            }

            // Insurance Updated
            if (newInsurance != null && !newInsurance.trim().isEmpty() && !newInsurance.equals(oldInsurance)) {
                Notification nIns = new Notification();
                nIns.setUserId(saved.getId());
                nIns.setTitle("Insurance Updated");
                nIns.setMessage(String.format("Insurance details for %s have been updated.", newInsurance));
                nIns.setType("insurance");
                notificationRepository.save(nIns);
            }
        } catch (Exception e) {
            System.err.println("Failed to generate profile notification: " + e.getMessage());
        }

        return saved;
    }

    public String changePassword(Long id,
                                 ChangePasswordRequest request) {

        Patient patient = patientRepository.findById(id)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Patient not found"
                    )
                );

        if (!patient.getPassword().equals(request.getCurrentPassword())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Current password is incorrect"
            );
        }

        patient.setPassword(request.getNewPassword());

        Patient saved = patientRepository.save(patient);

        try {
            Notification notification = new Notification();
            notification.setUserId(saved.getId());
            notification.setTitle("Password Changed");
            notification.setMessage("Your account password was changed successfully.");
            notification.setType("security");
            notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("Failed to generate password change notification: " + e.getMessage());
        }

        return "Password Updated Successfully";
    }

    public Map<String, String> uploadProfileImageToCloudinary(Long id, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to upload image.");
        }

        // Validate size (5MB max)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to upload image.");
        }

        // Validate file extension (jpg, jpeg, png, webp)
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        }

        List<String> allowedExtensions = Arrays.asList("jpg", "jpeg", "png", "webp");
        if (!allowedExtensions.contains(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to upload image.");
        }

        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

        try {
            // Delete old image from Cloudinary if exists
            if (patient.getCloudinaryPublicId() != null && !patient.getCloudinaryPublicId().isEmpty()) {
                try {
                    cloudinaryService.delete(patient.getCloudinaryPublicId());
                } catch (Exception e) {
                    System.err.println("Failed to delete old Cloudinary image: " + e.getMessage());
                }
            }

            // Upload new image to Cloudinary
            Map<String, String> uploadResult = cloudinaryService.upload(file, "healthcare/patients");
            String profileImageUrl = uploadResult.get("url");
            String publicId = uploadResult.get("public_id");

            // Update database
            patient.setProfileImageUrl(profileImageUrl);
            patient.setCloudinaryPublicId(publicId);
            patient.setProfileImage(profileImageUrl);
            patientRepository.save(patient);

            Map<String, String> response = new HashMap<>();
            response.put("profileImageUrl", profileImageUrl);
            response.put("publicId", publicId);
            return response;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to upload image.");
        }
    }

    public Patient uploadProfileImage(Long id, MultipartFile file) {
        uploadProfileImageToCloudinary(id, file);
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
    }

    public Resource getProfileImage(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

        if (patient.getProfileImage() == null || patient.getProfileImage().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile image not set");
        }

        Path filePath = Paths.get("uploads/profile").resolve(patient.getProfileImage());
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found");
            }
        } catch (MalformedURLException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found");
        }
    }

    public Patient deleteProfileImage(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

        if (patient.getCloudinaryPublicId() != null && !patient.getCloudinaryPublicId().isEmpty()) {
            try {
                cloudinaryService.delete(patient.getCloudinaryPublicId());
            } catch (Exception ignored) {}
            patient.setCloudinaryPublicId(null);
        }

        if (patient.getProfileImage() != null && !patient.getProfileImage().isEmpty() && !patient.getProfileImage().startsWith("http")) {
            Path filePath = Paths.get("uploads/profile").resolve(patient.getProfileImage());
            try {
                Files.deleteIfExists(filePath);
            } catch (IOException ignored) {}
        }

        patient.setProfileImage(null);
        patient.setProfileImageUrl(null);
        return patientRepository.save(patient);
    }

    // ===== Admin Patient Management Operations =====

    public List<PatientAdminDTO> getAllAdminPatients() {
        return patientRepository.findAllByOrderByIdDesc().stream().map(patient -> {
            long apptCount = appointmentRepository.countByPatientId(patient.getId());
            return new PatientAdminDTO(patient, apptCount);
        }).collect(Collectors.toList());
    }

    public PatientAdminDTO getAdminPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
        long apptCount = appointmentRepository.countByPatientId(patient.getId());
        return new PatientAdminDTO(patient, apptCount);
    }

    public PatientAdminDTO updateAdminPatient(Long id, PatientAdminUpdateRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            patient.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            patient.setPhone(request.getPhone().trim());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            patient.setStatus(request.getStatus().trim());
        }

        Patient updated = patientRepository.save(patient);
        long apptCount = appointmentRepository.countByPatientId(updated.getId());
        return new PatientAdminDTO(updated, apptCount);
    }

    @Transactional
    public void deleteAdminPatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

        // Clean up profile image file if exists
        if (patient.getProfileImage() != null && !patient.getProfileImage().isEmpty()) {
            try {
                Path filePath = Paths.get("uploads/profile").resolve(patient.getProfileImage());
                Files.deleteIfExists(filePath);
            } catch (IOException ignored) {}
        }

        // Clean up associated records
        appointmentRepository.deleteByPatientId(id);
        notificationRepository.deleteByUserId(id);
        favoriteRepository.deleteByPatientId(id);

        patientRepository.delete(patient);
    }
}