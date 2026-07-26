package com.bikedone.usermanagement.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import java.io.InputStream;
import java.util.Optional;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class FirebaseConfiguration {

    private final FirebaseProperties firebaseProperties;

    @Bean
    public Optional<FirebaseApp> firebaseApp() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return Optional.of(FirebaseApp.getInstance());
        }

        try {
            String path = firebaseProperties.getServiceAccountPath();
            if (path == null || path.isBlank()) {
                log.warn("Firebase service account path is not specified. Firebase Admin SDK will not be initialized.");
                return Optional.empty();
            }

            InputStream serviceAccount;
            if (path.startsWith("classpath:")) {
                Resource resource = new ClassPathResource(path.replace("classpath:", ""));
                if (!resource.exists()) {
                    log.warn("Firebase service account file not found on classpath: {}. Firebase Admin SDK will not be initialized.", path);
                    return Optional.empty();
                }
                serviceAccount = resource.getInputStream();
            } else {
                Resource resource = new FileSystemResource(path);
                if (!resource.exists()) {
                    log.warn("Firebase service account file not found at path: {}. Firebase Admin SDK will not be initialized.", path);
                    return Optional.empty();
                }
                serviceAccount = resource.getInputStream();
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            log.info("Successfully initialized FirebaseApp with service account: {}", path);
            return Optional.of(FirebaseApp.initializeApp(options));
        } catch (Exception e) {
            log.error("Failed to initialize Firebase App: {}", e.getMessage());
            return Optional.empty();
        }
    }

    @Bean
    public Optional<FirebaseAuth> firebaseAuth(Optional<FirebaseApp> firebaseApp) {
        if (firebaseApp.isEmpty()) {
            log.warn("FirebaseApp is empty, FirebaseAuth bean will be empty.");
            return Optional.empty();
        }
        return Optional.of(FirebaseAuth.getInstance(firebaseApp.get()));
    }
}
