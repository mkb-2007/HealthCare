import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../../api/api";
import { doctors as mockDoctors } from "../lib/data";

export interface Doctor {
  id: number | string;
  name: string;
  fullName?: string;
  specialization: string;
  speciality?: string;
  department?: string;
  hospital: string;
  hospitalName?: string;
  experience: number;
  rating: number;
  reviews?: number;
  fee?: number;
  consultationFee: number;
  availability: string;
  status?: string;
  availableToday?: boolean;
  profileImage: string;
  photo?: string;
  verified?: boolean;
  about?: string;
  qualifications?: string;
  languages?: string[];
  profileImageUrl?: string;
  imageFile?: File;
}

interface DoctorContextType {
  doctors: Doctor[];
  loading: boolean;
  fetchDoctors: () => Promise<void>;
  getDoctorById: (id: string | number) => Doctor | undefined;
  addDoctor: (docData: Partial<Doctor>, imageFile?: File) => Promise<Doctor>;
  updateDoctor: (id: string | number, docData: Partial<Doctor>, imageFile?: File) => Promise<Doctor>;
  deleteDoctor: (id: string | number) => Promise<void>;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export const DoctorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const normalizeDoctor = (d: any): Doctor => {
    const statusVal = d.status || d.availability || "Available";
    return {
      id: d.id,
      name: d.fullName || d.name || "Dr. Doctor",
      fullName: d.fullName || d.name || "Dr. Doctor",
      specialization: d.specialization || d.speciality || d.department || "General Medicine",
      speciality: d.specialization || d.speciality || d.department || "General Medicine",
      department: d.specialization || d.speciality || d.department || "General Medicine",
      hospital: d.hospital || d.hospitalName || "Apollo Hospital",
      experience: Number(d.experience) || 5,
      rating: Number(d.rating) || 4.8,
      reviews: Number(d.reviews) || 15,
      consultationFee: Number(d.consultationFee ?? d.fee ?? 500),
      fee: Number(d.consultationFee ?? d.fee ?? 500),
      availability: statusVal,
      status: statusVal,
      availableToday: d.availableToday ?? true,
      profileImage: d.profileImage || d.photo || "",
      photo: d.profileImage || d.photo || "",
      verified: d.verified ?? true,
      about: d.about || "",
      qualifications: d.qualifications || d.qualification || "MBBS, MD",
      languages: d.languages || ["English", "Hindi"],
    };
  };

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/doctor/all");
      if (Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeDoctor);
        setDoctorsList(normalized);
      } else {
        const mockNormalized = mockDoctors.map(normalizeDoctor);
        setDoctorsList(mockNormalized);
      }
    } catch (err) {
      console.warn("Failed to fetch doctors from backend API, falling back to mock data:", err);
      const mockNormalized = mockDoctors.map(normalizeDoctor);
      setDoctorsList(mockNormalized);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
    const handleUpdate = () => {
      fetchDoctors();
    };
    window.addEventListener("doctorsUpdated", handleUpdate);
    return () => {
      window.removeEventListener("doctorsUpdated", handleUpdate);
    };
  }, [fetchDoctors]);

  const getDoctorById = (id: string | number): Doctor | undefined => {
    if (!id) return undefined;
    const targetStr = String(id).trim();
    const targetIdNum = String(id).replace(/\D/g, "");
    return doctorsList.find(
      (d) =>
        String(d.id) === targetStr ||
        (targetIdNum && String(d.id).replace(/\D/g, "") === targetIdNum)
    );
  };

  const addDoctor = async (docData: Partial<Doctor>, imageFile?: File): Promise<Doctor> => {
    const fileToUpload = imageFile || docData.imageFile;
    
    if (fileToUpload) {
      const formData = new FormData();
      if (docData.fullName || docData.name) formData.append("fullName", docData.fullName || docData.name || "");
      if (docData.specialization || docData.department || docData.speciality) formData.append("specialization", docData.specialization || docData.department || docData.speciality || "");
      if (docData.qualifications || docData.qualification) formData.append("qualification", docData.qualifications || docData.qualification || "MBBS, MD");
      if (docData.experience) formData.append("experience", String(docData.experience));
      if (docData.hospital || docData.hospitalName) formData.append("hospital", docData.hospital || docData.hospitalName || "");
      if (docData.consultationFee ?? docData.fee) formData.append("consultationFee", String(docData.consultationFee ?? docData.fee ?? 500));
      if (docData.status || docData.availability) formData.append("status", docData.status || docData.availability || "Available");
      if (docData.about) formData.append("about", docData.about);
      formData.append("image", fileToUpload);

      try {
        const res = await api.post("/doctor/add", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        const created = normalizeDoctor(res.data);
        await fetchDoctors();
        window.dispatchEvent(new Event("doctorsUpdated"));
        return created;
      } catch (err) {
        console.warn("Multipart doctor add failed, falling back:", err);
      }
    }

    const payload = {
      fullName: docData.fullName || docData.name,
      specialization: docData.specialization || docData.department || docData.speciality,
      qualification: docData.qualifications || docData.qualification || "MBBS, MD",
      experience: docData.experience ? Number(docData.experience) : 5,
      hospital: docData.hospital || docData.hospitalName || "Apollo Hospital",
      consultationFee: docData.consultationFee ?? docData.fee ?? 500,
      rating: docData.rating ?? 4.8,
      reviews: docData.reviews ?? 15,
      status: docData.status || docData.availability || "Available",
      about: docData.about || "",
      profileImage: docData.profileImageUrl || docData.profileImage || docData.photo || "",
    };

    try {
      const res = await api.post("/doctor/add", payload);
      const created = normalizeDoctor(res.data);
      await fetchDoctors();
      window.dispatchEvent(new Event("doctorsUpdated"));
      return created;
    } catch (err) {
      console.warn("Backend API add failed, adding locally:", err);
      const newDoc = normalizeDoctor({
        id: `d_${Date.now()}`,
        ...docData,
      });
      setDoctorsList((prev) => [newDoc, ...prev]);
      window.dispatchEvent(new Event("doctorsUpdated"));
      return newDoc;
    }
  };

  const updateDoctor = async (id: string | number, docData: Partial<Doctor>, imageFile?: File): Promise<Doctor> => {
    const fileToUpload = imageFile || docData.imageFile;

    if (fileToUpload) {
      const formData = new FormData();
      if (docData.fullName || docData.name) formData.append("fullName", docData.fullName || docData.name || "");
      if (docData.specialization || docData.department || docData.speciality) formData.append("specialization", docData.specialization || docData.department || docData.speciality || "");
      if (docData.qualifications || docData.qualification) formData.append("qualification", docData.qualifications || docData.qualification || "");
      if (docData.experience) formData.append("experience", String(docData.experience));
      if (docData.hospital || docData.hospitalName) formData.append("hospital", docData.hospital || docData.hospitalName || "");
      if (docData.consultationFee ?? docData.fee) formData.append("consultationFee", String(docData.consultationFee ?? docData.fee));
      if (docData.status || docData.availability) formData.append("status", docData.status || docData.availability || "");
      if (docData.about) formData.append("about", docData.about);
      formData.append("image", fileToUpload);

      try {
        const res = await api.put(`/doctor/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        const updated = normalizeDoctor(res.data);
        await fetchDoctors();
        window.dispatchEvent(new Event("doctorsUpdated"));
        return updated;
      } catch (err) {
        console.warn("Multipart doctor update failed, falling back:", err);
      }
    }

    const payload = {
      fullName: docData.fullName || docData.name,
      specialization: docData.specialization || docData.department || docData.speciality,
      qualification: docData.qualifications || docData.qualification,
      experience: docData.experience ? Number(docData.experience) : undefined,
      hospital: docData.hospital || docData.hospitalName,
      consultationFee: docData.consultationFee ?? docData.fee,
      rating: docData.rating,
      reviews: docData.reviews,
      status: docData.status !== undefined ? docData.status : docData.availability,
      about: docData.about,
      profileImage: docData.profileImageUrl || docData.profileImage || docData.photo,
    };

    try {
      const res = await api.put(`/doctor/${id}`, payload);
      const updated = normalizeDoctor(res.data);
      await fetchDoctors();
      window.dispatchEvent(new Event("doctorsUpdated"));
      return updated;
    } catch (err) {
      console.warn("Backend API update failed, updating locally:", err);
      let updatedDoc: Doctor | null = null;
      setDoctorsList((prev) =>
        prev.map((d) => {
          if (String(d.id) === String(id)) {
            updatedDoc = normalizeDoctor({ ...d, ...docData });
            return updatedDoc;
          }
          return d;
        })
      );
      window.dispatchEvent(new Event("doctorsUpdated"));
      return updatedDoc || normalizeDoctor({ id, ...docData });
    }
  };

  const deleteDoctor = async (id: string | number): Promise<void> => {
    try {
      await api.delete(`/doctor/${id}`);
      await fetchDoctors();
    } catch (err) {
      console.warn("Backend API delete failed, removing locally:", err);
      setDoctorsList((prev) => prev.filter((d) => String(d.id) !== String(id)));
    } finally {
      window.dispatchEvent(new Event("doctorsUpdated"));
    }
  };

  return (
    <DoctorContext.Provider
      value={{
        doctors: doctorsList,
        loading,
        fetchDoctors,
        getDoctorById,
        addDoctor,
        updateDoctor,
        deleteDoctor,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctors = (): DoctorContextType => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error("useDoctors must be used within a DoctorProvider");
  }
  return context;
};
