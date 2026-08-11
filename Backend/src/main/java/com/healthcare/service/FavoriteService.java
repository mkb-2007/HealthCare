package com.healthcare.service;

import com.healthcare.dto.DoctorFavoriteResponse;
import com.healthcare.entity.Doctor;
import com.healthcare.entity.Favorite;
import com.healthcare.repository.DoctorRepository;
import com.healthcare.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Transactional
    public String addFavorite(Long patientId, Long doctorId) {
        if (!favoriteRepository.existsByPatientIdAndDoctorId(patientId, doctorId)) {
            Favorite favorite = new Favorite(patientId, doctorId);
            favoriteRepository.save(favorite);
        }
        return "Doctor added to favorites";
    }

    @Transactional
    public String removeFavorite(Long patientId, Long doctorId) {
        favoriteRepository.deleteByPatientIdAndDoctorId(patientId, doctorId);
        return "Doctor removed from favorites";
    }

    public List<DoctorFavoriteResponse> getFavorites(Long patientId) {
        List<Favorite> favorites = favoriteRepository.findByPatientId(patientId);
        List<DoctorFavoriteResponse> responseList = new ArrayList<>();

        for (Favorite fav : favorites) {
            Optional<Doctor> doctorOpt = doctorRepository.findById(fav.getDoctorId());
            if (doctorOpt.isPresent()) {
                Doctor doctor = doctorOpt.get();
                responseList.add(new DoctorFavoriteResponse(
                        doctor.getId(),
                        doctor.getFullName(),
                        doctor.getSpecialization(),
                        doctor.getHospital(),
                        doctor.getProfileImage() != null ? doctor.getProfileImage() : null
                ));
            } else {
                // Fallback for demo or mock doctor IDs
                responseList.add(new DoctorFavoriteResponse(
                        fav.getDoctorId(),
                        "Dr. Doctor #" + fav.getDoctorId(),
                        "General Medicine",
                        "HealthCare+ Multispecialty",
                        null
                ));
            }
        }

        return responseList;
    }
}
