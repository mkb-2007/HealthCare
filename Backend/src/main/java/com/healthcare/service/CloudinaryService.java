package com.healthcare.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Uploads an image to Cloudinary in a specified folder.
     *
     * @param file   The MultipartFile to upload
     * @param folder The folder path in Cloudinary
     * @return Map containing "url" and "public_id"
     * @throws IOException if upload fails
     */
    public Map<String, String> upload(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be null or empty");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", "auto"
                )
        );

        String secureUrl = (String) uploadResult.get("secure_url");
        String publicId = (String) uploadResult.get("public_id");

        return Map.of(
                "url", secureUrl != null ? secureUrl : "",
                "public_id", publicId != null ? publicId : ""
        );
    }

    /**
     * Uploads byte array to Cloudinary in a specified folder.
     *
     * @param imageBytes Raw image byte array to upload
     * @param folder     The folder path in Cloudinary
     * @return Map containing "url" and "public_id"
     * @throws IOException if upload fails
     */
    public Map<String, String> uploadBytes(byte[] imageBytes, String folder) throws IOException {
        if (imageBytes == null || imageBytes.length == 0) {
            throw new IllegalArgumentException("Image bytes must not be null or empty");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = cloudinary.uploader().upload(
                imageBytes,
                ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", "auto"
                )
        );

        String secureUrl = (String) uploadResult.get("secure_url");
        String publicId = (String) uploadResult.get("public_id");

        return Map.of(
                "url", secureUrl != null ? secureUrl : "",
                "public_id", publicId != null ? publicId : ""
        );
    }

    /**
     * Deletes an image from Cloudinary using its publicId.
     * Ignores if publicId is null or empty.
     *
     * @param publicId The public_id of the file to delete
     */
    public void delete(String publicId) {
        if (publicId == null || publicId.trim().isEmpty()) {
            return;
        }

        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            System.err.println("Failed to delete image from Cloudinary: " + e.getMessage());
        }
    }

    public Map uploadImage(MultipartFile file) throws IOException {
        return cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "healthcare"
                )
        );
    }

    public void deleteImage(String publicId) throws IOException {
        delete(publicId);
    }
}