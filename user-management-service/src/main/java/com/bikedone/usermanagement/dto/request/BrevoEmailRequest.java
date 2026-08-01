package com.bikedone.usermanagement.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class BrevoEmailRequest {

    private Sender sender;

    private List<Recipient> to;

    private String subject;

    private String htmlContent;

    private Map<String, String> headers;

}