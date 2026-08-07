package com.bikedone.order_management_service.service;

import com.bikedone.order_management_service.dto.response.VehicleBrandResponse;

import java.util.List;

public interface VehicleBrandService {

    List<VehicleBrandResponse> getAllBrands();

}