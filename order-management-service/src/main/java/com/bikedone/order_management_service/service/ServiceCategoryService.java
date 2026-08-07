package com.bikedone.order_management_service.service;

import com.bikedone.order_management_service.dto.response.ServiceCategoryResponse;

import java.util.List;

public interface ServiceCategoryService {

    List<ServiceCategoryResponse> getAllServiceCategories();

}