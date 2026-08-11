package com.healthcare.dto;

import com.healthcare.entity.Doctor;
import java.util.List;

public class AdminDashboardResponseDTO {

    private DashboardStatsDTO stats;
    private List<MonthlyCountDTO> appointmentsPerMonth;
    private List<MonthlyCountDTO> patientGrowth;
    private List<DepartmentDistributionDTO> departmentDistribution;
    private List<PatientAdminDTO> recentPatients;
    private List<LatestAppointmentDTO> latestAppointments;
    private List<Doctor> recentDoctors;

    public AdminDashboardResponseDTO() {
    }

    public AdminDashboardResponseDTO(
            DashboardStatsDTO stats,
            List<MonthlyCountDTO> appointmentsPerMonth,
            List<MonthlyCountDTO> patientGrowth,
            List<DepartmentDistributionDTO> departmentDistribution,
            List<PatientAdminDTO> recentPatients,
            List<LatestAppointmentDTO> latestAppointments,
            List<Doctor> recentDoctors
    ) {
        this.stats = stats;
        this.appointmentsPerMonth = appointmentsPerMonth;
        this.patientGrowth = patientGrowth;
        this.departmentDistribution = departmentDistribution;
        this.recentPatients = recentPatients;
        this.latestAppointments = latestAppointments;
        this.recentDoctors = recentDoctors;
    }

    // ===== Inner Helper DTOs =====

    public static class DashboardStatsDTO {
        private long totalDoctors;
        private long totalPatients;
        private long totalAppointments;
        private long todayAppointments;
        private long pendingAppointments;
        private long completedAppointments;
        private long cancelledAppointments;
        private long availableDoctors;
        private long busyDoctors;
        private long onLeaveDoctors;
        private String monthlyRevenue;

        public DashboardStatsDTO() {}

        public long getTotalDoctors() { return totalDoctors; }
        public void setTotalDoctors(long totalDoctors) { this.totalDoctors = totalDoctors; }

        public long getTotalPatients() { return totalPatients; }
        public void setTotalPatients(long totalPatients) { this.totalPatients = totalPatients; }

        public long getTotalAppointments() { return totalAppointments; }
        public void setTotalAppointments(long totalAppointments) { this.totalAppointments = totalAppointments; }

        public long getTodayAppointments() { return todayAppointments; }
        public void setTodayAppointments(long todayAppointments) { this.todayAppointments = todayAppointments; }

        public long getPendingAppointments() { return pendingAppointments; }
        public void setPendingAppointments(long pendingAppointments) { this.pendingAppointments = pendingAppointments; }

        public long getCompletedAppointments() { return completedAppointments; }
        public void setCompletedAppointments(long completedAppointments) { this.completedAppointments = completedAppointments; }

        public long getCancelledAppointments() { return cancelledAppointments; }
        public void setCancelledAppointments(long cancelledAppointments) { this.cancelledAppointments = cancelledAppointments; }

        public long getAvailableDoctors() { return availableDoctors; }
        public void setAvailableDoctors(long availableDoctors) { this.availableDoctors = availableDoctors; }

        public long getBusyDoctors() { return busyDoctors; }
        public void setBusyDoctors(long busyDoctors) { this.busyDoctors = busyDoctors; }

        public long getOnLeaveDoctors() { return onLeaveDoctors; }
        public void setOnLeaveDoctors(long onLeaveDoctors) { this.onLeaveDoctors = onLeaveDoctors; }

        public String getMonthlyRevenue() { return monthlyRevenue; }
        public void setMonthlyRevenue(String monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }
    }

    public static class MonthlyCountDTO {
        private String month;
        private long appointments;
        private long patients;

        public MonthlyCountDTO() {}

        public MonthlyCountDTO(String month, long appointments, long patients) {
            this.month = month;
            this.appointments = appointments;
            this.patients = patients;
        }

        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }

        public long getAppointments() { return appointments; }
        public void setAppointments(long appointments) { this.appointments = appointments; }

        public long getPatients() { return patients; }
        public void setPatients(long patients) { this.patients = patients; }
    }

    public static class DepartmentDistributionDTO {
        private String name;
        private long value;
        private String color;

        public DepartmentDistributionDTO() {}

        public DepartmentDistributionDTO(String name, long value, String color) {
            this.name = name;
            this.value = value;
            this.color = color;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public long getValue() { return value; }
        public void setValue(long value) { this.value = value; }

        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
    }

    // ===== Main DTO Getters & Setters =====

    public DashboardStatsDTO getStats() { return stats; }
    public void setStats(DashboardStatsDTO stats) { this.stats = stats; }

    public List<MonthlyCountDTO> getAppointmentsPerMonth() { return appointmentsPerMonth; }
    public void setAppointmentsPerMonth(List<MonthlyCountDTO> appointmentsPerMonth) { this.appointmentsPerMonth = appointmentsPerMonth; }

    public List<MonthlyCountDTO> getPatientGrowth() { return patientGrowth; }
    public void setPatientGrowth(List<MonthlyCountDTO> patientGrowth) { this.patientGrowth = patientGrowth; }

    public List<DepartmentDistributionDTO> getDepartmentDistribution() { return departmentDistribution; }
    public void setDepartmentDistribution(List<DepartmentDistributionDTO> departmentDistribution) { this.departmentDistribution = departmentDistribution; }

    public List<PatientAdminDTO> getRecentPatients() { return recentPatients; }
    public void setRecentPatients(List<PatientAdminDTO> recentPatients) { this.recentPatients = recentPatients; }

    public List<LatestAppointmentDTO> getLatestAppointments() { return latestAppointments; }
    public void setLatestAppointments(List<LatestAppointmentDTO> latestAppointments) { this.latestAppointments = latestAppointments; }

    public List<Doctor> getRecentDoctors() { return recentDoctors; }
    public void setRecentDoctors(List<Doctor> recentDoctors) { this.recentDoctors = recentDoctors; }
}
