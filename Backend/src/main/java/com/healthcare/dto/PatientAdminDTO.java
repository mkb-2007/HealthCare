package com.healthcare.dto;

import com.healthcare.entity.Patient;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PatientAdminDTO {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String height;
    private String weight;
    private String allergies;
    private String chronicConditions;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyRelationship;
    private String insuranceProvider;
    private String policyNumber;
    private LocalDate insuranceValidUntil;
    private String profileImage;
    private String status;
    private long appointmentCount;
    private LocalDateTime createdAt;

    public PatientAdminDTO() {
    }

    public PatientAdminDTO(Patient patient, long appointmentCount) {
        this.id = patient.getId();
        this.fullName = patient.getFullName();
        this.email = patient.getEmail();
        this.phone = patient.getPhone();
        this.dateOfBirth = patient.getDateOfBirth();
        this.gender = patient.getGender();
        this.bloodGroup = patient.getBloodGroup();
        this.height = patient.getHeight();
        this.weight = patient.getWeight();
        this.allergies = patient.getAllergies();
        this.chronicConditions = patient.getChronicConditions();
        this.emergencyContactName = patient.getEmergencyContactName();
        this.emergencyContactPhone = patient.getEmergencyContactPhone();
        this.emergencyRelationship = patient.getEmergencyRelationship();
        this.insuranceProvider = patient.getInsuranceProvider();
        this.policyNumber = patient.getPolicyNumber();
        this.insuranceValidUntil = patient.getInsuranceValidUntil();
        this.profileImage = patient.getProfileImage();
        this.status = patient.getStatus();
        this.appointmentCount = appointmentCount;
        this.createdAt = patient.getCreatedAt();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getHeight() {
        return height;
    }

    public void setHeight(String height) {
        this.height = height;
    }

    public String getWeight() {
        return weight;
    }

    public void setWeight(String weight) {
        this.weight = weight;
    }

    public String getAllergies() {
        return allergies;
    }

    public void setAllergies(String allergies) {
        this.allergies = allergies;
    }

    public String getChronicConditions() {
        return chronicConditions;
    }

    public void setChronicConditions(String chronicConditions) {
        this.chronicConditions = chronicConditions;
    }

    public String getEmergencyContactName() {
        return emergencyContactName;
    }

    public void setEmergencyContactName(String emergencyContactName) {
        this.emergencyContactName = emergencyContactName;
    }

    public String getEmergencyContactPhone() {
        return emergencyContactPhone;
    }

    public void setEmergencyContactPhone(String emergencyContactPhone) {
        this.emergencyContactPhone = emergencyContactPhone;
    }

    public String getEmergencyRelationship() {
        return emergencyRelationship;
    }

    public void setEmergencyRelationship(String emergencyRelationship) {
        this.emergencyRelationship = emergencyRelationship;
    }

    public String getInsuranceProvider() {
        return insuranceProvider;
    }

    public void setInsuranceProvider(String insuranceProvider) {
        this.insuranceProvider = insuranceProvider;
    }

    public String getPolicyNumber() {
        return policyNumber;
    }

    public void setPolicyNumber(String policyNumber) {
        this.policyNumber = policyNumber;
    }

    public LocalDate getInsuranceValidUntil() {
        return insuranceValidUntil;
    }

    public void setInsuranceValidUntil(LocalDate insuranceValidUntil) {
        this.insuranceValidUntil = insuranceValidUntil;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getAppointmentCount() {
        return appointmentCount;
    }

    public void setAppointmentCount(long appointmentCount) {
        this.appointmentCount = appointmentCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
