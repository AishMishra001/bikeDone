package com.bikedone.order_management_service.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImageUploadService {

    /**
     * Upload multiple image files to Cloudinary.
     *
     * @param files list of multipart image files (max 5)
     * @return list of secure Cloudinary URLs
     */
    List<String> uploadImages(List<MultipartFile> files);
}
