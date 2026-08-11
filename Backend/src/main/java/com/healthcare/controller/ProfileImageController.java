package com.healthcare.controller;

import com.healthcare.entity.Patient;
import com.healthcare.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/patient")
@CrossOrigin("*")
public class ProfileImageController {

    @Autowired
    private PatientService patientService;

    @PostMapping("/upload-image/{id}")
    public ResponseEntity<Patient> uploadProfileImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        Patient updatedPatient = patientService.uploadProfileImage(id, file);
        return ResponseEntity.ok(updatedPatient);
    }

    @GetMapping("/image/{id}")
    public ResponseEntity<Resource> getProfileImage(@PathVariable Long id) {
        Resource resource = patientService.getProfileImage(id);

        String contentType = "application/octet-stream";
        try {
            if (resource.getURL().toString().endsWith(".png")) {
                contentType = MediaType.IMAGE_PNG_VALUE;
            } else if (resource.getURL().toString().endsWith(".jpg") || resource.getURL().toString().endsWith(".jpeg")) {
                contentType = MediaType.IMAGE_JPEG_VALUE;
            } else if (resource.getURL().toString().endsWith(".webp")) {
                contentType = "image/webp";
            }
        } catch (IOException ignored) {}

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
