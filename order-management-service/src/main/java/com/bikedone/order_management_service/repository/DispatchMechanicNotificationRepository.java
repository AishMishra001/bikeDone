package com.bikedone.order_management_service.repository;

import com.bikedone.order_management_service.entity.DispatchMechanicNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface DispatchMechanicNotificationRepository extends JpaRepository<DispatchMechanicNotification, UUID> {

    List<DispatchMechanicNotification> findByDispatchRunIdAndRoundNumber(UUID dispatchRunId, Integer roundNumber);

    List<DispatchMechanicNotification> findByServiceRequestId(UUID serviceRequestId);

    @Query("SELECT dmn FROM DispatchMechanicNotification dmn " +
           "JOIN ServiceRequest sr ON sr.id = dmn.serviceRequestId " +
           "WHERE dmn.mechanicId = :mechanicId " +
           "AND dmn.notificationStatus = com.bikedone.order_management_service.enums.NotificationStatus.NOTIFIED " +
           "AND sr.status = com.bikedone.order_management_service.enums.ServiceRequestStatus.SEARCHING_MECHANIC " +
           "AND dmn.notifiedAt >= :sinceTime " +
           "ORDER BY dmn.notifiedAt DESC")
    List<DispatchMechanicNotification> findActivePendingNotifications(
            @Param("mechanicId") UUID mechanicId,
            @Param("sinceTime") LocalDateTime sinceTime
    );
}
