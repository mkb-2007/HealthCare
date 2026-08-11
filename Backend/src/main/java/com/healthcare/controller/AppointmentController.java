package com.healthcare.controller;

import com.healthcare.dto.AppointmentRequest;
import com.healthcare.entity.Appointment;
import com.healthcare.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointment")
@CrossOrigin("*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    // POST /api/appointment - Book an appointment
    @PostMapping
    public ResponseEntity<Appointment> bookAppointment(@RequestBody AppointmentRequest request) {
        Appointment created = appointmentService.bookAppointment(request);
        return ResponseEntity.ok(created);
    }

    // GET /api/appointment/all - Show all appointments (Admin)
    @GetMapping({"", "/all"})
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    // GET /api/appointment/patient/{patientId} - Show all appointments for patient
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByPatient(@PathVariable Long patientId) {
        List<Appointment> appointments = appointmentService.getAppointmentsByPatientId(patientId);
        return ResponseEntity.ok(appointments);
    }

    // DELETE /api/appointment/{id} - Cancel an appointment
    @DeleteMapping("/{id}")
    public ResponseEntity<Appointment> cancelAppointment(@PathVariable Long id) {
        Appointment cancelled = appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(cancelled);
    }

    // PUT /api/appointment/{id} - Reschedule an appointment
    @PutMapping("/{id}")
    public ResponseEntity<Appointment> rescheduleAppointment(@PathVariable Long id, @RequestBody AppointmentRequest request) {
        Appointment updated = appointmentService.rescheduleAppointment(id, request);
        return ResponseEntity.ok(updated);
    }
}
