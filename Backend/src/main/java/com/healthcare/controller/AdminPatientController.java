package com.healthcare.controller;

import com.healthcare.dto.PatientAdminDTO;
import com.healthcare.dto.PatientAdminUpdateRequest;
import com.healthcare.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/patients")
@CrossOrigin("*")
public class AdminPatientController {

    @Autowired
    private PatientService patientService;

    @GetMapping
    public ResponseEntity<List<PatientAdminDTO>> getAllPatients() {
        List<PatientAdminDTO> patients = patientService.getAllAdminPatients();
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientAdminDTO> getPatientById(@PathVariable Long id) {
        PatientAdminDTO patient = patientService.getAdminPatientById(id);
        return ResponseEntity.ok(patient);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientAdminDTO> updatePatient(
            @PathVariable Long id,
            @RequestBody PatientAdminUpdateRequest request) {
        PatientAdminDTO updated = patientService.updateAdminPatient(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePatient(@PathVariable Long id) {
        patientService.deleteAdminPatient(id);
        return ResponseEntity.ok("Patient deleted successfully");
    }
}
