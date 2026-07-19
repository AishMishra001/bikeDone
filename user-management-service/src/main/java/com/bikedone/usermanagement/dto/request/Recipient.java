package com.bikedone.usermanagement.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Recipient {

    private String email;
    private String name;

}