package com.bikedone.order_management_service.service.impl;

import com.bikedone.order_management_service.common.logging.LogLevel;
import com.bikedone.order_management_service.common.logging.LogStep;
import com.bikedone.order_management_service.common.logging.Logger;
import com.bikedone.order_management_service.dto.response.RequestTypeResponse;
import com.bikedone.order_management_service.mapper.RequestTypeMapper;
import com.bikedone.order_management_service.repository.RequestTypeRepository;
import com.bikedone.order_management_service.service.RequestTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RequestTypeServiceImpl implements RequestTypeService {

    private final RequestTypeRepository requestTypeRepository;

    @Override
    public List<RequestTypeResponse> getAllRequestTypes() {

        Logger.printLog(
                LogLevel.INFO,
                LogStep.REQUEST_TYPE,
                "Fetching all request types",
                "Querying active request types ordered by displayName",
                null,
                null
        );

        List<RequestTypeResponse> result = requestTypeRepository
                .findByActiveTrueOrderByDisplayNameAsc()
                .stream()
                .map(RequestTypeMapper::toResponse)
                .toList();

        Logger.printLog(
                LogLevel.INFO,
                LogStep.REQUEST_TYPE,
                "Request types fetched successfully",
                "Returned " + result.size() + " request type(s)",
                null,
                null
        );

        return result;
    }
}
