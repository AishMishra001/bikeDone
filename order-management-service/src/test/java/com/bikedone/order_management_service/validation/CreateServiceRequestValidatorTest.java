package com.bikedone.order_management_service.validation;

import com.bikedone.order_management_service.dto.request.CreateServiceRequestRequest;
import com.bikedone.order_management_service.dto.request.CurrentLocationRequest;
import com.bikedone.order_management_service.common.datetime.DateTimeProvider;
import com.bikedone.order_management_service.entity.RequestType;
import com.bikedone.order_management_service.enums.RequestTypeCode;
import com.bikedone.order_management_service.exception.BadRequestException;
import com.bikedone.order_management_service.repository.RequestTypeRepository;
import com.bikedone.order_management_service.repository.ServiceCategoryRepository;
import com.bikedone.order_management_service.repository.ServiceIssueRepository;
import com.bikedone.order_management_service.repository.ServiceSlotRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class CreateServiceRequestValidatorTest {

    private final CreateServiceRequestValidator validator = new CreateServiceRequestValidator(
            mock(RequestTypeRepository.class),
            mock(ServiceCategoryRepository.class),
            mock(ServiceSlotRepository.class),
            mock(ServiceIssueRepository.class),
            new DateTimeProvider(Clock.fixed(Instant.parse("2026-08-06T08:00:00Z"), ZoneOffset.UTC))
    );

    @Test
    void permitsImmediateRequestWithCurrentLocation() {
        CreateServiceRequestRequest request = baseRequest();
        request.setCurrentLocation(currentLocation());
        request.setIsImmediate(true);

        assertDoesNotThrow(() -> validator.validate(request, requestType(RequestTypeCode.BREAKDOWN)));
    }

    @Test
    void requiresDateAndSlotForScheduledRequests() {
        CreateServiceRequestRequest request = baseRequest();
        request.setCurrentLocation(currentLocation());

        assertThrows(
                BadRequestException.class,
                () -> validator.validate(request, requestType(RequestTypeCode.REPAIR))
        );
    }

    @Test
    void permitsScheduledRequestAtLeastThirtyMinutesInTheFuture() {
        CreateServiceRequestRequest request = baseRequest();
        request.setCurrentLocation(currentLocation());
        request.setPreferredServiceDate(LocalDate.of(2026, 8, 6));
        request.setPreferredServiceTime(LocalTime.of(8, 30));

        assertDoesNotThrow(() -> validator.validate(request, requestType(RequestTypeCode.REPAIR)));
    }

    @Test
    void rejectsScheduledRequestLessThanThirtyMinutesInTheFuture() {
        CreateServiceRequestRequest request = baseRequest();
        request.setCurrentLocation(currentLocation());
        request.setPreferredServiceDate(LocalDate.of(2026, 8, 6));
        request.setPreferredServiceTime(LocalTime.of(8, 29));

        assertThrows(
                BadRequestException.class,
                () -> validator.validate(request, requestType(RequestTypeCode.REPAIR))
        );
    }

    @Test
    void requiresEitherSavedAddressOrCurrentLocation() {
        CreateServiceRequestRequest request = baseRequest();

        assertThrows(
                BadRequestException.class,
                () -> validator.validate(request, requestType(RequestTypeCode.BREAKDOWN))
        );
    }

    @Test
    void rejectsBothSavedAddressAndCurrentLocation() {
        CreateServiceRequestRequest request = baseRequest();
        request.setAddressId(UUID.randomUUID());
        request.setCurrentLocation(currentLocation());

        assertThrows(
                BadRequestException.class,
                () -> validator.validate(request, requestType(RequestTypeCode.BREAKDOWN))
        );
    }

    private CreateServiceRequestRequest baseRequest() {
        CreateServiceRequestRequest request = new CreateServiceRequestRequest();
        request.setCustomerVehicleId(UUID.randomUUID());
        request.setRequestTypeId(1L);
        request.setIsIssueIdentified(false);
        return request;
    }

    private CurrentLocationRequest currentLocation() {
        CurrentLocationRequest location = new CurrentLocationRequest();
        location.setLatitude(new BigDecimal("28.6139"));
        location.setLongitude(new BigDecimal("77.2090"));
        return location;
    }

    private RequestType requestType(RequestTypeCode code) {
        RequestType requestType = new RequestType();
        requestType.setRequestTypeCode(code);
        return requestType;
    }
}
