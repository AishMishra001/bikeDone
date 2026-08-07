package com.bikedone.usermanagement.dto.response;

import com.bikedone.usermanagement.enums.IntegrationProvider;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MobileVerificationResponse {

    private IntegrationProvider provider;

    private boolean clientShouldInitiateFirebase;

}