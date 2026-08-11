package com.healthcare.controller;

import com.healthcare.dto.ChangePasswordRequest;
import com.healthcare.dto.LoginRequest;
import com.healthcare.dto.PatientRegisterRequest;
import com.healthcare.dto.PatientUpdateRequest;
import com.healthcare.entity.Patient;
import com.healthcare.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient")
@CrossOrigin("*")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @PostMapping("/register")
    public String register(@RequestBody PatientRegisterRequest request) {
        return patientService.registerPatient(request);
    }

    @PostMapping("/login")
    public ResponseEntity<Patient> login(@RequestBody LoginRequest request) {

        Patient patient = patientService.login(request);

        return ResponseEntity.ok(patient);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Patient> updatePatient(
            @PathVariable Long id,
            @RequestBody PatientUpdateRequest request) {

        Patient updatedPatient = patientService.updatePatient(id, request);

        return ResponseEntity.ok(updatedPatient);
    }

    @PutMapping("/change-password/{id}")
    public ResponseEntity<String> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest request) {

        return ResponseEntity.ok(
                patientService.changePassword(id, request)
        );
    }
}