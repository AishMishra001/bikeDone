package com.bikedone.order_management_service.controller;

import com.bikedone.order_management_service.common.response.ApiResponse;
import com.bikedone.order_management_service.service.ImageUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Handles image uploads to Cloudinary for service requests.
 *
 * POST /api/v1/service-requests/upload-images
 *   Content-Type: multipart/form-data
 *   Body:        files[] (1–5 image files, max 5 MB each)
 *
 * Returns a list of secure Cloudinary URLs which the client should
 * include in the CreateServiceRequest payload.
 */
@RestController
@RequestMapping("/api/v1/service-requests")
@RequiredArgsConstructor
public class ImageUploadController {

    private final ImageUploadService imageUploadService;

    @PostMapping(value = "/upload-images", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<List<String>>> uploadImages(
            @RequestParam("files") List<MultipartFile> files) {

        List<String> urls = imageUploadService.uploadImages(files);

        return ResponseEntity.ok(
                ApiResponse.success(urls, "Images uploaded successfully.")
        );
    }
}
