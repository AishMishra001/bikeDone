package com.bikedone.vehicle_management_service.common.logging;

import org.slf4j.LoggerFactory;

public final class Logger {

    private static final org.slf4j.Logger logger =
            LoggerFactory.getLogger(Logger.class);

    private Logger() {
    }

    public static void printLog(
            LogLevel logLevel,
            LogStep step,
            String message,
            String description,
            String userId,
            String entityId) {

        String logMessage = String.format(
                "service=%s | level=%s | step=%s | userId=%s | entityId=%s | message=%s | description=%s",
                LogConstants.SERVICE_NAME,
                logLevel,
                step,
                userId,
                entityId,
                message,
                description
        );

        switch (logLevel) {

            case INFO -> logger.info(logMessage);

            case DEBUG -> logger.debug(logMessage);

            case WARN -> logger.warn(logMessage);

            case ERROR, CRITICAL -> logger.error(logMessage);

            default -> logger.info(logMessage);
        }
    }
}