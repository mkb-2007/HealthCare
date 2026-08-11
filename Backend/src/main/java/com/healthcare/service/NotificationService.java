package com.healthcare.service;

import com.healthcare.entity.Notification;
import com.healthcare.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public Map<String, String> markAllAsRead(Long userId) {
        List<Notification> unreadList = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        for (Notification n : unreadList) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unreadList);

        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        return response;
    }

    public Map<String, String> deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new RuntimeException("Notification not found with id: " + id);
        }
        notificationRepository.deleteById(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification deleted successfully");
        return response;
    }

    public Notification createNotification(Long userId, String title, String message, String type, String referenceType, Long referenceId) {
        Notification notification = new Notification();
        notification.setUserId(userId != null ? userId : 1L);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReferenceType(referenceType);
        notification.setReferenceId(referenceId);
        notification.setIsRead(false);
        return notificationRepository.save(notification);
    }
}
