package com.bikedone.order_management_service.service.impl;

import com.bikedone.order_management_service.config.CloudinaryProperties;
import com.bikedone.order_management_service.exception.BadRequestException;
import com.bikedone.order_management_service.service.ImageUploadService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ImageUploadServiceImpl implements ImageUploadService {

    private static final int MAX_FILES       = 5;
    private static final long MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

    private final Cloudinary cloudinary;
    private final CloudinaryProperties cloudinaryProperties;

    @Override
    public List<String> uploadImages(List<MultipartFile> files) {

        if (files == null || files.isEmpty()) {
            throw new BadRequestException("At least one image is required.");
        }

        if (files.size() > MAX_FILES) {
            throw new BadRequestException("Maximum " + MAX_FILES + " images are allowed.");
        }

        List<String> uploadedUrls = new ArrayList<>();

        for (MultipartFile file : files) {

            validateFile(file);

            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> result = cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "folder",          cloudinaryProperties.getFolder(),
                                "resource_type",   "image",
                                "allowed_formats", "jpg,jpeg,png,webp,heic"
                        )
                );

                String secureUrl = (String) result.get("secure_url");
                uploadedUrls.add(secureUrl);

            } catch (IOException e) {
                throw new BadRequestException("Failed to upload image: " + file.getOriginalFilename());
            }
        }

        return uploadedUrls;
    }

    private void validateFile(MultipartFile file) {

        if (file.isEmpty()) {
            throw new BadRequestException("Empty file is not allowed.");
        }

        if (file.getSize() > MAX_FILE_BYTES) {
            throw new BadRequestException(
                    "File '" + file.getOriginalFilename() + "' exceeds 5 MB limit."
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException(
                    "Only image files are allowed. Received: " + contentType
            );
        }
    }
}
