package com.bikedone.usermanagement;

import com.bikedone.usermanagement.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class UserManagementServiceApplication {

	public static void main(String[] args) {
//		codex resume 019f5962-87e3-7411-94d6-0339501ab27d
		SpringApplication.run(UserManagementServiceApplication.class, args);
	}
}