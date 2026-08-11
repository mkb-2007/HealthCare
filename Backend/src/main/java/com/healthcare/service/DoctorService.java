package com.healthcare.service;

import com.healthcare.dto.DoctorRequest;
import com.healthcare.entity.Doctor;
import com.healthcare.repository.DoctorRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostConstruct
    public void seedInitialDoctors() {
        if (doctorRepository.count() == 0) {
            createAndSaveDoctor("Dr. Rahul Sharma", "rahul.sharma@apollo.com", "+91 98765 43210", "Cardiology", "MBBS, MD (Cardiology), FACC", 15, "Apollo Heart Institute", 1200.0, null, "Senior Cardiologist with 15+ years of experience in invasive & non-invasive cardiology.", "Available", 4.9, 128);
            createAndSaveDoctor("Dr. Priya Sharma", "priya.sharma@fortis.com", "+91 98765 43211", "Pediatrics", "MBBS, DCH, MD (Pediatrics)", 12, "Fortis Healthcare", 800.0, null, "Compassionate pediatrician dedicated to child health, growth monitoring, and newborn care.", "Available", 4.8, 95);
            createAndSaveDoctor("Dr. Ananya Roy", "ananya.roy@max.com", "+91 98765 43212", "Dermatology", "MBBS, MD (Dermatology)", 8, "Max Super Speciality", 900.0, null, "Specialist in clinical dermatology, cosmetic care, laser surgery, and skincare treatment.", "Available", 4.7, 82);
            createAndSaveDoctor("Dr. Vikram Malhotra", "vikram.m@aiims.edu", "+91 98765 43213", "Neurology", "MBBS, DM (Neurology)", 18, "AIIMS New Delhi", 1500.0, null, "Renowned neurologist specializing in stroke treatment, epilepsy management, and brain care.", "Available", 4.9, 210);
            createAndSaveDoctor("Dr. Rajesh Iyer", "rajesh.iyer@manipal.com", "+91 98765 43214", "Orthopedics", "MBBS, MS (Orthopedics)", 14, "Manipal Hospital", 1000.0, null, "Expert orthopedic surgeon specializing in joint replacements and sports trauma recovery.", "Available", 4.8, 115);
            createAndSaveDoctor("Dr. Sneha Kulkarni", "sneha.k@columbia.com", "+91 98765 43215", "Gynecology", "MBBS, MS (Obstetrics & Gynecology)", 10, "Columbia Asia Hospital", 850.0, null, "Specialist in high-risk pregnancy, women's wellness, laparoscopic surgeries, and maternal care.", "Available", 4.8, 90);
        }
        // Asynchronously migrate any doctors missing Cloudinary images on startup
        new Thread(() -> {
            try {
                generateMissingDoctorImages();
            } catch (Exception e) {
                System.err.println("Startup image migration warning: " + e.getMessage());
            }
        }).start();
    }

    private void createAndSaveDoctor(String name, String email, String phone, String spec, String qual, int exp, String hosp, double fee, String img, String about, String status, double rating, int reviews) {
        Doctor doc = new Doctor();
        doc.setFullName(name);
        doc.setEmail(email);
        doc.setPhone(phone);
        doc.setSpecialization(spec);
        doc.setQualification(qual);
        doc.setExperience(exp);
        doc.setHospital(hosp);
        doc.setConsultationFee(fee);
        if (img != null) {
            doc.setProfileImage(img);
            if (img.startsWith("http")) {
                doc.setProfileImageUrl(img);
            }
        }
        doc.setAbout(about);
        doc.setStatus(status);
        doc.setRating(rating);
        doc.setReviews(reviews);
        doctorRepository.save(doc);
    }

    public Doctor addDoctor(DoctorRequest request, MultipartFile image) {
        Doctor doctor = new Doctor();
        mapRequestToDoctor(request, doctor);
        handleImageUpload(doctor, image);
        return doctorRepository.save(doctor);
    }

    public Doctor addDoctor(DoctorRequest request) {
        return addDoctor(request, null);
    }

    public Doctor updateDoctor(Long id, DoctorRequest request, MultipartFile image) {
        Doctor doctor = getDoctorById(id);
        mapRequestToDoctor(request, doctor);
        if (image != null && !image.isEmpty()) {
            if (doctor.getCloudinaryPublicId() != null && !doctor.getCloudinaryPublicId().isEmpty()) {
                try {
                    cloudinaryService.delete(doctor.getCloudinaryPublicId());
                } catch (Exception e) {
                    System.err.println("Failed to delete old doctor Cloudinary image: " + e.getMessage());
                }
            }
            handleImageUpload(doctor, image);
        }
        return doctorRepository.save(doctor);
    }

    public Doctor updateDoctor(Long id, DoctorRequest request) {
        return updateDoctor(id, request, null);
    }

    public void deleteDoctor(Long id) {
        Doctor doctor = getDoctorById(id);
        if (doctor.getCloudinaryPublicId() != null && !doctor.getCloudinaryPublicId().isEmpty()) {
            try {
                cloudinaryService.delete(doctor.getCloudinaryPublicId());
            } catch (Exception e) {
                System.err.println("Failed to delete doctor Cloudinary image: " + e.getMessage());
            }
        }
        doctorRepository.delete(doctor);
    }

    private void handleImageUpload(Doctor doctor, MultipartFile image) {
        if (image != null && !image.isEmpty()) {
            try {
                Map<String, String> uploadResult = cloudinaryService.upload(image, "healthcare/doctors");
                String url = uploadResult.get("url");
                String publicId = uploadResult.get("public_id");
                if (url != null && !url.isEmpty()) {
                    doctor.setProfileImageUrl(url);
                    doctor.setProfileImage(url);
                }
                if (publicId != null && !publicId.isEmpty()) {
                    doctor.setCloudinaryPublicId(publicId);
                }
            } catch (Exception e) {
                System.err.println("Failed to upload doctor image to Cloudinary: " + e.getMessage());
            }
        }
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Doctor not found"
                    )
                );
    }

    private void mapRequestToDoctor(DoctorRequest request, Doctor doctor) {
        if (request.getFullName() != null) doctor.setFullName(request.getFullName());
        if (request.getEmail() != null) doctor.setEmail(request.getEmail());
        else if (doctor.getEmail() == null) doctor.setEmail("doctor" + System.currentTimeMillis() + "@healthcare.com");
        if (request.getPhone() != null) doctor.setPhone(request.getPhone());
        else if (doctor.getPhone() == null) doctor.setPhone("+91 99999 00000");
        if (request.getSpecialization() != null) doctor.setSpecialization(request.getSpecialization());
        if (request.getQualification() != null) doctor.setQualification(request.getQualification());
        else if (doctor.getQualification() == null) doctor.setQualification("MBBS, MD");
        if (request.getExperience() != null) doctor.setExperience(request.getExperience());
        if (request.getHospital() != null) doctor.setHospital(request.getHospital());
        if (request.getConsultationFee() != null) doctor.setConsultationFee(request.getConsultationFee());
        if (request.getAbout() != null) doctor.setAbout(request.getAbout());
        if (request.getStatus() != null) doctor.setStatus(request.getStatus());
        if (request.getRating() != null) doctor.setRating(request.getRating());
        if (request.getReviews() != null) doctor.setReviews(request.getReviews());
        if (request.getProfileImage() != null) {
            doctor.setProfileImage(request.getProfileImage());
            if (request.getProfileImage().startsWith("http")) {
                doctor.setProfileImageUrl(request.getProfileImage());
            }
        }
    }

    public Map<String, Object> generateMissingDoctorImages() {
        List<Doctor> doctors = doctorRepository.findAll();
        int count = 0;

        for (Doctor doc : doctors) {
            boolean hasNoCloudinaryUrl = doc.getProfileImageUrl() == null || doc.getProfileImageUrl().trim().isEmpty() || !doc.getProfileImageUrl().startsWith("http");
            if (hasNoCloudinaryUrl) {
                try {
                    String seedName = doc.getFullName() != null ? doc.getFullName().replaceAll("[^a-zA-Z0-9]", "") : "Doctor" + doc.getId();
                    String dicebearUrl = "https://api.dicebear.com/9.x/personas/png?seed=" + seedName;

                    byte[] imageBytes;
                    try (InputStream in = new URI(dicebearUrl).toURL().openStream()) {
                        imageBytes = in.readAllBytes();
                    }

                    Map<String, String> uploadResult = cloudinaryService.uploadBytes(imageBytes, "healthcare/doctors");
                    String secureUrl = uploadResult.get("url");
                    String publicId = uploadResult.get("public_id");

                    if (secureUrl != null && !secureUrl.isEmpty()) {
                        doc.setProfileImageUrl(secureUrl);
                        doc.setProfileImage(secureUrl);
                        doc.setCloudinaryPublicId(publicId);
                        doctorRepository.save(doc);
                        count++;
                    }
                } catch (Exception e) {
                    System.err.println("Failed to generate Cloudinary image for doctor " + doc.getId() + ": " + e.getMessage());
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Generated Cloudinary images for doctors successfully");
        response.put("count", count);
        return response;
    }

    public Map<String, Object> uploadZipImagesAndAssignToDoctors() {
        Path tempDir = Paths.get("temp_doctor_images").toAbsolutePath();
        if (!Files.exists(tempDir) || !Files.isDirectory(tempDir)) {
            tempDir = Paths.get("c:/Users/mirza/Desktop/HealthCare+/Backend/temp_doctor_images");
        }

        List<Map<String, String>> uploadedList = new ArrayList<>();

        if (Files.exists(tempDir) && Files.isDirectory(tempDir)) {
            try (Stream<Path> stream = Files.list(tempDir)) {
                List<Path> files = stream.filter(Files::isRegularFile).collect(Collectors.toList());
                for (Path file : files) {
                    try {
                        byte[] bytes = Files.readAllBytes(file);
                        if (bytes.length > 100) { // Filter out empty or placeholder 29-byte files
                            Map<String, String> uploadResult = cloudinaryService.uploadBytes(bytes, "healthcare/doctors");
                            String url = uploadResult.get("url");
                            String publicId = uploadResult.get("public_id");
                            if (url != null && !url.isEmpty()) {
                                Map<String, String> item = new HashMap<>();
                                item.put("url", url);
                                item.put("public_id", publicId != null ? publicId : "");
                                uploadedList.add(item);
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("Failed to upload " + file.getFileName() + ": " + e.getMessage());
                    }
                }
            } catch (IOException e) {
                System.err.println("Failed to read temp_doctor_images dir: " + e.getMessage());
            }
        }

        int updatedDoctorsCount = 0;
        List<String> cloudinaryUrls = new ArrayList<>();

        if (!uploadedList.isEmpty()) {
            List<Doctor> doctors = doctorRepository.findAll();
            List<Map<String, String>> shuffledList = new ArrayList<>(uploadedList);
            Collections.shuffle(shuffledList); // Shuffle images as requested!

            for (int i = 0; i < doctors.size(); i++) {
                Doctor doc = doctors.get(i);
                Map<String, String> imgData = shuffledList.get(i % shuffledList.size());
                String url = imgData.get("url");
                String publicId = imgData.get("public_id");

                doc.setProfileImageUrl(url);
                doc.setCloudinaryPublicId(publicId);
                doc.setProfileImage(url);
                doctorRepository.save(doc);
                updatedDoctorsCount++;
            }

            for (Map<String, String> item : uploadedList) {
                cloudinaryUrls.add(item.get("url"));
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Uploaded doctor images to Cloudinary and assigned shuffled images to all doctors successfully!");
        response.put("totalImagesUploaded", uploadedList.size());
        response.put("doctorsUpdated", updatedDoctorsCount);
        response.put("cloudinaryUrls", cloudinaryUrls);
        return response;
    }
}
