package com.healthcare.controller;

import com.healthcare.dto.AdminDashboardResponseDTO;
import com.healthcare.dto.LatestAppointmentDTO;
import com.healthcare.service.AdminDashboardService;
import com.healthcare.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin("*")
public class AdminDashboardController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private AdminDashboardService adminDashboardService;

    @GetMapping("/data")
    public ResponseEntity<AdminDashboardResponseDTO> getDashboardData() {
        AdminDashboardResponseDTO data = adminDashboardService.getDashboardData();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/latest-appointments")
    public ResponseEntity<List<LatestAppointmentDTO>> getLatestAppointments() {
        List<LatestAppointmentDTO> latest = appointmentService.getLatestAppointments();
        return ResponseEntity.ok(latest);
    }
}
