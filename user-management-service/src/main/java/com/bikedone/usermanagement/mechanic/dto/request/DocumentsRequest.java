package com.bikedone.usermanagement.mechanic.dto.request;

import lombok.Data;

@Data
public class DocumentsRequest {

    private String aadhaarUrl;
    private String panUrl;
    private String drivingLicenseUrl;
    private String shopPhotoUrl;
    private String profilePhotoUrl;
}
