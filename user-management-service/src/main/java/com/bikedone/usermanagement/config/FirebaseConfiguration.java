package com.bikedone.usermanagement.config;

import com.bikedone.usermanagement.entity.IntegrationConfiguration;
import com.bikedone.usermanagement.enums.IntegrationProvider;
import com.bikedone.usermanagement.repository.IntegrationConfigurationRepository;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class FirebaseConfiguration {

    private final IntegrationConfigurationRepository integrationConfigurationRepository;

    @Bean
    public Optional<FirebaseApp> firebaseApp() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return Optional.of(FirebaseApp.getInstance());
        }

        try {
            InputStream serviceAccount = null;

            // Load JSON configuration directly from Database (integration_configuration table)
            Optional<IntegrationConfiguration> dbConfig = integrationConfigurationRepository.findByProviderAndIsActiveTrue(IntegrationProvider.FIREBASE);
            if (dbConfig.isPresent() && dbConfig.get().getConfiguration() != null 
                    && !dbConfig.get().getConfiguration().isBlank() 
                    && !dbConfig.get().getConfiguration().trim().equals("{}")) {
                log.info("Loading Firebase service account configuration directly from database (integration_configuration).");
                serviceAccount = new ByteArrayInputStream(dbConfig.get().getConfiguration().getBytes(StandardCharsets.UTF_8));
            }

            if (serviceAccount == null) {
                log.warn("Firebase service account configuration not found in DB (integration_configuration). Firebase Admin SDK will not be initialized.");
                return Optional.empty();
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            log.info("Successfully initialized FirebaseApp with Service Account Credentials from Database.");
            return Optional.of(FirebaseApp.initializeApp(options));
        } catch (Exception e) {
            log.error("Failed to initialize Firebase App from DB configuration", e);
            return Optional.empty();
        }
    }

    @Bean
    public Optional<FirebaseAuth> firebaseAuth() {
        if (FirebaseApp.getApps().isEmpty()) {
            log.warn("FirebaseApp is not initialized, FirebaseAuth bean will be empty.");
            return Optional.empty();
        }
        log.info("Successfully created FirebaseAuth bean from active FirebaseApp.");
        return Optional.of(FirebaseAuth.getInstance());
    }
}
