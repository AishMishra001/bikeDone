package com.bikedone.vehicle_management_service.util;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class RequestNumberGenerator {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("yyyyMMdd");

    public String generate() {

        String date = LocalDate.now().format(DATE_FORMAT);

        int random = ThreadLocalRandom.current().nextInt(1000, 9999);

        return "BDREQ" + date + random;
    }
}