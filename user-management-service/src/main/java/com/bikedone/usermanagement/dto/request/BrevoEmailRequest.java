package com.bikedone.usermanagement.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BrevoEmailRequest {

    private Sender sender;

    private List<Recipient> to;

    private String subject;

    private String htmlContent;

}