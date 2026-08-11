package com.healthcare.dto;

public class DoctorFavoriteResponse {
    private Long id;
    private String fullName;
    private String specialization;
    private String hospital;
    private String profileImage;

    public DoctorFavoriteResponse() {}

    public DoctorFavoriteResponse(Long id, String fullName, String specialization, String hospital, String profileImage) {
        this.id = id;
        this.fullName = fullName;
        this.specialization = specialization;
        this.hospital = hospital;
        this.profileImage = profileImage;
    }

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

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getHospital() {
        return hospital;
    }

    public void setHospital(String hospital) {
        this.hospital = hospital;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }
}
