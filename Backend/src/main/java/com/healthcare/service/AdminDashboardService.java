package com.healthcare.service;

import com.healthcare.dto.AdminDashboardResponseDTO;
import com.healthcare.dto.AdminDashboardResponseDTO.DashboardStatsDTO;
import com.healthcare.dto.AdminDashboardResponseDTO.DepartmentDistributionDTO;
import com.healthcare.dto.AdminDashboardResponseDTO.MonthlyCountDTO;
import com.healthcare.dto.LatestAppointmentDTO;
import com.healthcare.dto.PatientAdminDTO;
import com.healthcare.entity.Appointment;
import com.healthcare.entity.Doctor;
import com.healthcare.entity.Patient;
import com.healthcare.repository.AppointmentRepository;
import com.healthcare.repository.DoctorRepository;
import com.healthcare.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientService patientService;
    private final AppointmentService appointmentService;

    @Autowired
    public AdminDashboardService(
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            PatientService patientService,
            AppointmentService appointmentService
    ) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.patientService = patientService;
        this.appointmentService = appointmentService;
    }

    public AdminDashboardResponseDTO getDashboardData() {
        List<Doctor> allDoctors = doctorRepository.findAll();
        List<Patient> allPatients = patientRepository.findAll();
        List<Appointment> allAppointments = appointmentRepository.findAll();

        // 1. Calculate Summary Stats
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setTotalDoctors(allDoctors.size());
        stats.setTotalPatients(allPatients.size());
        stats.setTotalAppointments(allAppointments.size());

        // Today's date check formats
        String todayIso = LocalDate.now().toString(); // e.g. 2026-08-04
        String todayFormatted = LocalDate.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy", Locale.ENGLISH)); // e.g. Aug 04, 2026

        long todayCount = allAppointments.stream().filter(a -> {
            if (a.getAppointmentDate() == null) return false;
            String d = a.getAppointmentDate().trim();
            return d.contains(todayIso) || d.contains(todayFormatted) || d.equalsIgnoreCase(todayIso) || d.equalsIgnoreCase(todayFormatted);
        }).count();
        stats.setTodayAppointments(todayCount);

        long pendingCount = allAppointments.stream().filter(a -> {
            String s = a.getStatus() != null ? a.getStatus().trim() : "";
            return s.equalsIgnoreCase("Pending") || s.equalsIgnoreCase("Upcoming");
        }).count();
        stats.setPendingAppointments(pendingCount);

        long completedCount = allAppointments.stream().filter(a -> {
            String s = a.getStatus() != null ? a.getStatus().trim() : "";
            return s.equalsIgnoreCase("Completed");
        }).count();
        stats.setCompletedAppointments(completedCount);

        long cancelledCount = allAppointments.stream().filter(a -> {
            String s = a.getStatus() != null ? a.getStatus().trim() : "";
            return s.equalsIgnoreCase("Cancelled");
        }).count();
        stats.setCancelledAppointments(cancelledCount);

        long availableDocs = allDoctors.stream().filter(d -> {
            String s = d.getStatus() != null ? d.getStatus().trim() : "";
            return s.equalsIgnoreCase("Available");
        }).count();
        stats.setAvailableDoctors(availableDocs);

        long busyDocs = allDoctors.stream().filter(d -> {
            String s = d.getStatus() != null ? d.getStatus().trim() : "";
            return s.equalsIgnoreCase("Busy");
        }).count();
        stats.setBusyDoctors(busyDocs);

        long onLeaveDocs = allDoctors.stream().filter(d -> {
            String s = d.getStatus() != null ? d.getStatus().trim() : "";
            return s.equalsIgnoreCase("On Leave") || s.equalsIgnoreCase("ON_LEAVE");
        }).count();
        stats.setOnLeaveDoctors(onLeaveDocs);

        // Revenue calculation: Completed appointments * doctor fees (or average fee ₹850)
        double totalRev = 0.0;
        for (Appointment appt : allAppointments) {
            if ("Completed".equalsIgnoreCase(appt.getStatus())) {
                if (appt.getDoctorId() != null) {
                    Optional<Doctor> docOpt = doctorRepository.findById(appt.getDoctorId());
                    if (docOpt.isPresent() && docOpt.get().getConsultationFee() != null) {
                        totalRev += docOpt.get().getConsultationFee();
                        continue;
                    }
                }
                totalRev += 800.0; // fallback standard fee
            }
        }
        stats.setMonthlyRevenue(String.format("₹%,.0f", totalRev));

        // 2. Appointments per Month Chart Data (Jan - Dec)
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        Map<String, Long> apptMonthMap = new LinkedHashMap<>();
        Map<String, Long> patientMonthMap = new LinkedHashMap<>();

        for (String m : months) {
            apptMonthMap.put(m, 0L);
            patientMonthMap.put(m, 0L);
        }

        for (Appointment a : allAppointments) {
            String m = getMonthAbbreviation(a.getCreatedAt(), a.getAppointmentDate());
            if (m != null && apptMonthMap.containsKey(m)) {
                apptMonthMap.put(m, apptMonthMap.get(m) + 1);
            }
        }

        for (Patient p : allPatients) {
            String m = getMonthAbbreviation(p.getCreatedAt(), null);
            if (m != null && patientMonthMap.containsKey(m)) {
                patientMonthMap.put(m, patientMonthMap.get(m) + 1);
            }
        }

        List<MonthlyCountDTO> apptMonthList = new ArrayList<>();
        List<MonthlyCountDTO> patientGrowthList = new ArrayList<>();

        long cumulativePatients = 0;
        for (String m : months) {
            long apptCnt = apptMonthMap.get(m);
            long patientCnt = patientMonthMap.get(m);
            cumulativePatients += patientCnt;

            apptMonthList.add(new MonthlyCountDTO(m, apptCnt, 0));
            // Show cumulative or monthly patient growth
            patientGrowthList.add(new MonthlyCountDTO(m, 0, cumulativePatients > 0 ? cumulativePatients : patientCnt));
        }

        // 3. Department Distribution Pie Chart Data
        Map<String, Long> deptCounts = allDoctors.stream().collect(
                Collectors.groupingBy(
                        d -> (d.getSpecialization() != null && !d.getSpecialization().trim().isEmpty())
                                ? d.getSpecialization().trim()
                                : "General Medicine",
                        Collectors.counting()
                )
        );

        String[] colorPalette = {"#2563eb", "#14b8a6", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6", "#10b981", "#f97316"};
        List<DepartmentDistributionDTO> departmentDistribution = new ArrayList<>();
        int colorIdx = 0;

        for (Map.Entry<String, Long> entry : deptCounts.entrySet()) {
            String color = colorPalette[colorIdx % colorPalette.length];
            departmentDistribution.add(new DepartmentDistributionDTO(entry.getKey(), entry.getValue(), color));
            colorIdx++;
        }

        if (departmentDistribution.isEmpty()) {
            departmentDistribution.add(new DepartmentDistributionDTO("General Medicine", 1, "#2563eb"));
        }

        // 4. Recent Patients (top 5 ordered by id DESC)
        List<PatientAdminDTO> recentPatients = patientService.getAllAdminPatients().stream()
                .limit(5)
                .collect(Collectors.toList());

        // 5. Latest Appointments (top 5 ordered by createdAt DESC)
        List<LatestAppointmentDTO> latestAppointments = appointmentService.getLatestAppointments();

        // 6. Recent Doctors (top 5 ordered by id DESC)
        List<Doctor> recentDoctors = doctorRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .limit(5)
                .collect(Collectors.toList());

        return new AdminDashboardResponseDTO(
                stats,
                apptMonthList,
                patientGrowthList,
                departmentDistribution,
                recentPatients,
                latestAppointments,
                recentDoctors
        );
    }

    private String getMonthAbbreviation(LocalDateTime createdAt, String dateStr) {
        if (createdAt != null) {
            return createdAt.format(DateTimeFormatter.ofPattern("MMM", Locale.ENGLISH));
        }
        if (dateStr != null && !dateStr.trim().isEmpty()) {
            try {
                String str = dateStr.trim();
                String first3 = str.substring(0, 3);
                for (String m : new String[]{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"}) {
                    if (m.equalsIgnoreCase(first3)) {
                        return m;
                    }
                }
            } catch (Exception ignored) {}
        }
        return LocalDate.now().format(DateTimeFormatter.ofPattern("MMM", Locale.ENGLISH));
    }
}
