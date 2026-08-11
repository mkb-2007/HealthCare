package com.healthcare.controller;

import com.healthcare.entity.Patient;
import com.healthcare.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/patient")
@CrossOrigin("*")
public class PatientProfileController {

    @Autowired
    private PatientService patientService;

    @PostMapping({"/profile/upload-image", "/profile/upload-image/{id}"})
    public ResponseEntity<Map<String, String>> uploadProfileImageCloudinary(
            @PathVariable(value = "id", required = false) Long pathId,
            @RequestParam(value = "patientId", required = false) Long patientIdParam,
            @RequestParam(value = "id", required = false) Long idParam,
            @RequestParam("file") MultipartFile file) {

        Long id = pathId != null ? pathId : (patientIdParam != null ? patientIdParam : idParam);
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Patient ID is required");
        }

        Map<String, String> response = patientService.uploadProfileImageToCloudinary(id, file);
        return ResponseEntity.ok(response);
    }

    @PostMapping({"/profile/upload/{id}", "/upload-image/{id}"})
    public ResponseEntity<Patient> uploadProfileImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        Patient updatedPatient = patientService.uploadProfileImage(id, file);
        return ResponseEntity.ok(updatedPatient);
    }

    @DeleteMapping({"/profile/image/{id}", "/remove-image/{id}"})
    public ResponseEntity<Patient> deleteProfileImage(@PathVariable Long id) {
        Patient updatedPatient = patientService.deleteProfileImage(id);
        return ResponseEntity.ok(updatedPatient);
    }
}
