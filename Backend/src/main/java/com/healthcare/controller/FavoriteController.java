package com.healthcare.controller;

import com.healthcare.dto.DoctorFavoriteResponse;
import com.healthcare.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin("*")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @PostMapping("/{doctorId}")
    public String addFavorite(
            @PathVariable Long doctorId,
            @RequestParam(required = false, defaultValue = "1") Long patientId
    ) {
        return favoriteService.addFavorite(patientId, doctorId);
    }

    @DeleteMapping("/{doctorId}")
    public String removeFavorite(
            @PathVariable Long doctorId,
            @RequestParam(required = false, defaultValue = "1") Long patientId
    ) {
        return favoriteService.removeFavorite(patientId, doctorId);
    }

    @GetMapping
    public List<DoctorFavoriteResponse> getFavorites(
            @RequestParam(required = false, defaultValue = "1") Long patientId
    ) {
        return favoriteService.getFavorites(patientId);
    }
}
