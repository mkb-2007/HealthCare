package com.healthcare.controller;

import com.healthcare.entity.Notification;
import com.healthcare.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin("*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(
            @RequestParam(required = false, defaultValue = "1") Long userId
    ) {
        List<Notification> notifications = notificationService.getNotificationsForUser(userId);
        return ResponseEntity.ok(notifications);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        Notification updated = notificationService.markAsRead(id);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            @RequestParam(required = false, defaultValue = "1") Long userId
    ) {
        Map<String, String> response = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable Long id) {
        Map<String, String> response = notificationService.deleteNotification(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Map<String, Object> payload) {
        Long userId = payload.get("userId") != null ? Long.parseLong(payload.get("userId").toString()) : 1L;
        String title = payload.get("title") != null ? payload.get("title").toString() : "Notification";
        String message = payload.get("message") != null ? payload.get("message").toString() : "";
        String type = payload.get("type") != null ? payload.get("type").toString() : "general";
        String referenceType = payload.get("referenceType") != null ? payload.get("referenceType").toString() : null;
        Long referenceId = payload.get("referenceId") != null ? Long.parseLong(payload.get("referenceId").toString()) : null;

        Notification created = notificationService.createNotification(userId, title, message, type, referenceType, referenceId);
        return ResponseEntity.ok(created);
    }
}
