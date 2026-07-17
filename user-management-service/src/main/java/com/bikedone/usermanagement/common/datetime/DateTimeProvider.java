package com.bikedone.usermanagement.common.datetime;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DateTimeProvider {

    private final Clock appClock;

    public LocalDateTime now() {
        return LocalDateTime.now(appClock);
    }
}