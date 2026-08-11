package com.healthcare.service;

import com.healthcare.dto.AppointmentRequest;
import com.healthcare.entity.Appointment;
import com.healthcare.entity.Doctor;
import com.healthcare.entity.Patient;
import com.healthcare.entity.Notification;
import com.healthcare.repository.AppointmentRepository;
import com.healthcare.repository.DoctorRepository;
import com.healthcare.repository.NotificationRepository;
import com.healthcare.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final NotificationRepository notificationRepository;

    @Autowired
    public AppointmentService(
            AppointmentRepository appointmentRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            NotificationRepository notificationRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.notificationRepository = notificationRepository;
    }

    public Appointment bookAppointment(AppointmentRequest request) {
        Appointment appointment = new Appointment();
        appointment.setPatientId(request.getPatientId());
        appointment.setDoctorId(request.getDoctorId());
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setType(request.getType() != null ? request.getType() : "In-person");
        appointment.setReason(request.getReason());
        appointment.setStatus(request.getStatus() != null ? request.getStatus() : "Upcoming");

        // Auto fill Doctor information if available
        if (request.getDoctorId() != null) {
            Optional<Doctor> doctorOpt = doctorRepository.findById(request.getDoctorId());
            if (doctorOpt.isPresent()) {
                Doctor doctor = doctorOpt.get();
                appointment.setDoctorName(doctor.getFullName());
                appointment.setSpecialization(doctor.getSpecialization());
                appointment.setHospital(doctor.getHospital());
                if (doctor.getProfileImage() != null) {
                    appointment.setDoctorImage(doctor.getProfileImage());
                }
            }
        }
        if (request.getDoctorName() != null) {
            appointment.setDoctorName(request.getDoctorName());
        }
        if (request.getSpecialization() != null) {
            appointment.setSpecialization(request.getSpecialization());
        }
        if (request.getDoctorImage() != null) {
            appointment.setDoctorImage(request.getDoctorImage());
        }
        if (request.getHospital() != null) {
            appointment.setHospital(request.getHospital());
        }

        // Auto fill Patient information if available
        if (request.getPatientId() != null) {
            Optional<Patient> patientOpt = patientRepository.findById(request.getPatientId());
            if (patientOpt.isPresent()) {
                appointment.setPatientName(patientOpt.get().getFullName());
            }
        }
        if (request.getPatientName() != null) {
            appointment.setPatientName(request.getPatientName());
        }

        if (request.getTimeSlot() != null) {
            appointment.setTimeSlot(request.getTimeSlot());
            appointment.setAppointmentTime(parseTimeSlot(request.getTimeSlot()));
        }

        Appointment savedAppointment = appointmentRepository.save(appointment);

        try {
            Long userId = savedAppointment.getPatientId() != null ? savedAppointment.getPatientId() : 1L;
            String doctorName = savedAppointment.getDoctorName() != null ? savedAppointment.getDoctorName() : "Doctor";
            String dateStr = savedAppointment.getAppointmentDate() != null ? savedAppointment.getAppointmentDate().toString() : "";
            String timeStr = savedAppointment.getTimeSlot() != null ? savedAppointment.getTimeSlot() : "";

            String title = "Appointment Booked";
            String message = String.format("Your appointment with Dr. %s on %s at %s has been booked successfully.", doctorName, dateStr, timeStr);

            boolean exists = savedAppointment.getId() != null &&
                    notificationRepository.existsByReferenceTypeAndReferenceId("appointment", savedAppointment.getId());

            if (!exists) {
                Notification notification = new Notification();
                notification.setUserId(userId);
                notification.setTitle(title);
                notification.setMessage(message);
                notification.setType("appointment");
                notification.setReferenceType("appointment");
                notification.setReferenceId(savedAppointment.getId());
                notification.setIsRead(false);

                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            System.err.println("Failed to generate notification: " + e.getMessage());
        }

        return savedAppointment;
    }

    private void enrichDoctorImage(Appointment appointment) {
        if (appointment != null && (appointment.getDoctorImage() == null || appointment.getDoctorImage().trim().isEmpty())) {
            if (appointment.getDoctorId() != null) {
                doctorRepository.findById(appointment.getDoctorId()).ifPresent(doc -> {
                    if (doc.getProfileImage() != null && !doc.getProfileImage().trim().isEmpty()) {
                        appointment.setDoctorImage(doc.getProfileImage());
                    }
                });
            }
        }
    }

    public List<Appointment> getAllAppointments() {
        List<Appointment> list = appointmentRepository.findAll();
        list.forEach(this::enrichDoctorImage);
        return list;
    }

    public List<Appointment> getAppointmentsByPatientId(Long patientId) {
        List<Appointment> list = appointmentRepository.findByPatientId(patientId);
        list.forEach(this::enrichDoctorImage);
        return list;
    }

    public Appointment cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        appointment.setStatus("Cancelled");
        Appointment saved = appointmentRepository.save(appointment);

        try {
            Long userId = saved.getPatientId() != null ? saved.getPatientId() : 1L;
            String doctorName = saved.getDoctorName() != null ? saved.getDoctorName() : "Doctor";
            String dateStr = saved.getAppointmentDate() != null ? saved.getAppointmentDate().toString() : "";

            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setTitle("Appointment Cancelled");
            notification.setMessage(String.format("Your appointment with Dr. %s on %s has been cancelled.", doctorName, dateStr));
            notification.setType("appointment");
            notification.setReferenceType("appointment");
            notification.setReferenceId(saved.getId());
            notification.setIsRead(false);

            notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("Failed to generate cancellation notification: " + e.getMessage());
        }

        return saved;
    }

    public Appointment rescheduleAppointment(Long id, AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));

        if (request.getAppointmentDate() != null) {
            appointment.setAppointmentDate(request.getAppointmentDate());
        }
        if (request.getTimeSlot() != null) {
            appointment.setTimeSlot(request.getTimeSlot());
            appointment.setAppointmentTime(parseTimeSlot(request.getTimeSlot()));
        }
        if (request.getReason() != null) {
            appointment.setReason(request.getReason());
        }
        if (request.getStatus() != null) {
            appointment.setStatus(request.getStatus());
        }

        Appointment saved = appointmentRepository.save(appointment);

        try {
            Long userId = saved.getPatientId() != null ? saved.getPatientId() : 1L;
            String doctorName = saved.getDoctorName() != null ? saved.getDoctorName() : "Doctor";
            String dateStr = saved.getAppointmentDate() != null ? saved.getAppointmentDate().toString() : "";
            String timeStr = saved.getTimeSlot() != null ? saved.getTimeSlot() : "";

            String title = "Appointment Rescheduled";
            String message = String.format("Your appointment with Dr. %s has been rescheduled to %s at %s.", doctorName, dateStr, timeStr);

            if ("Confirmed".equalsIgnoreCase(saved.getStatus())) {
                title = "Appointment Confirmed";
                message = String.format("Your appointment with Dr. %s on %s at %s has been confirmed.", doctorName, dateStr, timeStr);
            } else if ("Completed".equalsIgnoreCase(saved.getStatus())) {
                title = "Appointment Completed";
                message = String.format("Your consultation with Dr. %s has been marked as completed.", doctorName);
            }

            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setType("appointment");
            notification.setReferenceType("appointment");
            notification.setReferenceId(saved.getId());
            notification.setIsRead(false);

            notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("Failed to generate reschedule notification: " + e.getMessage());
        }

        return saved;
    }

    public List<com.healthcare.dto.LatestAppointmentDTO> getLatestAppointments() {
        List<Appointment> latest = appointmentRepository.findTop5ByOrderByCreatedAtDesc();
        List<com.healthcare.dto.LatestAppointmentDTO> result = new java.util.ArrayList<>();

        for (Appointment a : latest) {
            com.healthcare.dto.LatestAppointmentDTO dto = new com.healthcare.dto.LatestAppointmentDTO();
            dto.setAppointmentId(a.getId());
            dto.setPatientId(a.getPatientId());
            dto.setPatientName(a.getPatientName());
            dto.setDoctorId(a.getDoctorId());
            dto.setDoctorName(a.getDoctorName());
            dto.setDoctorDepartment(a.getSpecialization());
            dto.setAppointmentDate(a.getAppointmentDate());
            dto.setAppointmentTime(a.getTimeSlot());
            dto.setStatus(a.getStatus());
            dto.setCreatedAt(a.getCreatedAt());

            // Enrich with patient profile image
            if (a.getPatientId() != null) {
                patientRepository.findById(a.getPatientId()).ifPresent(patient -> {
                    dto.setPatientProfileImage(patient.getProfileImage());
                    // Fall back to patient fullName if appointment didn't store patient name
                    if (dto.getPatientName() == null || dto.getPatientName().trim().isEmpty()) {
                        dto.setPatientName(patient.getFullName());
                    }
                });
            }

            result.add(dto);
        }

        return result;
    }

    private LocalTime parseTimeSlot(String timeSlot) {
        if (timeSlot == null || timeSlot.trim().isEmpty()) {
            return null;
        }
        String timeStr = timeSlot.trim();
        try {
            DateTimeFormatter formatter = new DateTimeFormatterBuilder()
                    .parseCaseInsensitive()
                    .appendPattern("[hh:mm a][h:mm a][HH:mm]")
                    .toFormatter(Locale.ENGLISH);
            return LocalTime.parse(timeStr, formatter);
        } catch (Exception e) {
            try {
                return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH));
            } catch (Exception ex) {
                return null;
            }
        }
    }
}
