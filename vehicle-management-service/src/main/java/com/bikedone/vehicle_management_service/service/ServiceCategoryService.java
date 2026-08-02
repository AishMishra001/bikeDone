package com.bikedone.vehicle_management_service.service;

import com.bikedone.vehicle_management_service.dto.response.ServiceCategoryResponse;

import java.util.List;

public interface ServiceCategoryService {

    List<ServiceCategoryResponse> getAllServiceCategories();

}