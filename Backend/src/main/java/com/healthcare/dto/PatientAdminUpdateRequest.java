package com.healthcare.dto;

public class PatientAdminUpdateRequest {

    private String fullName;
    private String phone;
    private String status;

    public PatientAdminUpdateRequest() {
    }

    public PatientAdminUpdateRequest(String fullName, String phone, String status) {
        this.fullName = fullName;
        this.phone = phone;
        this.status = status;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
