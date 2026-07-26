package com.bikedone.usermanagement.factory;

import com.bikedone.usermanagement.enums.IntegrationProvider;
import com.bikedone.usermanagement.strategy.MobileVerificationStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MobileVerificationStrategyFactoryTest {

    @Mock
    private MobileVerificationStrategy awsStrategy;

    @Mock
    private MobileVerificationStrategy firebaseStrategy;

    private MobileVerificationStrategyFactory factory;

    @BeforeEach
    void setUp() {
        factory = new MobileVerificationStrategyFactory(List.of(awsStrategy, firebaseStrategy));
    }

    @Test
    void shouldReturnAwsStrategyForAwsSnsProvider() {
        when(awsStrategy.getProvider()).thenReturn(IntegrationProvider.AWS_SNS);
        MobileVerificationStrategy result = factory.getStrategy(IntegrationProvider.AWS_SNS);
        assertEquals(awsStrategy, result);
    }

    @Test
    void shouldReturnFirebaseStrategyForFirebaseProvider() {
        when(firebaseStrategy.getProvider()).thenReturn(IntegrationProvider.FIREBASE);
        MobileVerificationStrategy result = factory.getStrategy(IntegrationProvider.FIREBASE);
        assertEquals(firebaseStrategy, result);
    }
}
