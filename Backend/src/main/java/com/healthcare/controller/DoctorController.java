package com.healthcare.controller;

import com.healthcare.dto.DoctorRequest;
import com.healthcare.entity.Doctor;
import com.healthcare.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor")
@CrossOrigin("*")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @PostMapping(value = {"", "/add"}, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Doctor> addDoctorJson(@RequestBody DoctorRequest request) {
        Doctor created = doctorService.addDoctor(request);
        return ResponseEntity.ok(created);
    }

    @PostMapping(value = {"", "/add"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Doctor> addDoctorMultipart(
            @ModelAttribute DoctorRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        MultipartFile uploadImage = image != null ? image : file;
        Doctor created = doctorService.addDoctor(request, uploadImage);
        return ResponseEntity.ok(created);
    }

    @GetMapping({"", "/all"})
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Doctor> updateDoctorJson(@PathVariable Long id, @RequestBody DoctorRequest request) {
        Doctor updated = doctorService.updateDoctor(id, request);
        return ResponseEntity.ok(updated);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Doctor> updateDoctorMultipart(
            @PathVariable Long id,
            @ModelAttribute DoctorRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        MultipartFile uploadImage = image != null ? image : file;
        Doctor updated = doctorService.updateDoctor(id, request, uploadImage);
        return ResponseEntity.ok(updated);
    }

    @PostMapping({"/generate-images", "/admin/doctors/generate-images"})
    public ResponseEntity<Map<String, Object>> generateDoctorImages() {
        Map<String, Object> result = doctorService.generateMissingDoctorImages();
        return ResponseEntity.ok(result);
    }

    @PostMapping({"/upload-zip-images", "/upload-zip"})
    public ResponseEntity<Map<String, Object>> uploadZipImages() {
        Map<String, Object> result = doctorService.uploadZipImagesAndAssignToDoctors();
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok().build();
    }
}
