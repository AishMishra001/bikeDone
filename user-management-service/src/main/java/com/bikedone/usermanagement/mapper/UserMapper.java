package com.bikedone.usermanagement.mapper;

import com.bikedone.usermanagement.dto.request.SignupRequest;
import com.bikedone.usermanagement.dto.response.SignupResponse;
import com.bikedone.usermanagement.dto.response.UserLoginResponse;
import com.bikedone.usermanagement.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "emailVerified", ignore = true)
    @Mapping(target = "mobileVerified", ignore = true)
    @Mapping(target = "password", ignore = true)
    User toEntity(SignupRequest request);

    @Mapping(source = "id", target = "userId")
    SignupResponse toResponse(User user);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "role.roleCode", target = "role")
    UserLoginResponse toLoginResponse(User user);
}