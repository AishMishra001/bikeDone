package com.bikedone.usermanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyFirebaseTokenRequest {

    @NotBlank(message = "Firebase ID Token is required")
    private String firebaseIdToken;

}
