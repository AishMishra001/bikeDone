package com.bikedone.vehicle_management_service.service;

import com.bikedone.vehicle_management_service.dto.response.RequestTypeResponse;

import java.util.List;

public interface RequestTypeService {

    List<RequestTypeResponse> getAllRequestTypes();

}