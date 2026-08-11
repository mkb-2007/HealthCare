package com.healthcare.repository;

import com.healthcare.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByPatientId(Long patientId);
    Optional<Favorite> findByPatientIdAndDoctorId(Long patientId, Long doctorId);
    boolean existsByPatientIdAndDoctorId(Long patientId, Long doctorId);
    void deleteByPatientIdAndDoctorId(Long patientId, Long doctorId);
    void deleteByPatientId(Long patientId);
}
