package com.venuevista.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.venuevista.dto.*;
import com.venuevista.service.RegistrationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class RegistrationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private RegistrationService registrationService;

    @InjectMocks
    private RegistrationController registrationController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(registrationController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/auth/registration/start returns 200 and session data")
    void testStartRegistrationEndpoint() throws Exception {
        RegistrationStartRequest req = new RegistrationStartRequest(
                "Ananya Roy", "ananya@example.com", "9876543210", "Password@123", "Password@123");

        RegistrationSessionResponse resp = RegistrationSessionResponse.builder()
                .sessionId("test-session-uuid")
                .fullName("Ananya Roy")
                .email("ananya@example.com")
                .phone("+919876543210")
                .currentStep("EMAIL_VERIFICATION")
                .emailVerified(false)
                .phoneVerified(false)
                .demoMode(true)
                .demoEmailOtp("123456")
                .message("Verification code generated.")
                .build();

        when(registrationService.startRegistration(any(RegistrationStartRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/auth/registration/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.sessionId").value("test-session-uuid"))
                .andExpect(jsonPath("$.data.currentStep").value("EMAIL_VERIFICATION"))
                .andExpect(jsonPath("$.data.demoEmailOtp").value("123456"));
    }

    @Test
    @DisplayName("POST /api/auth/registration/verify-email returns 200 on success")
    void testVerifyEmailEndpoint() throws Exception {
        VerifyEmailOtpRequest req = new VerifyEmailOtpRequest("test-session-uuid", "123456");

        RegistrationSessionResponse resp = RegistrationSessionResponse.builder()
                .sessionId("test-session-uuid")
                .currentStep("PHONE_VERIFICATION")
                .emailVerified(true)
                .phoneVerified(false)
                .demoMode(true)
                .demoPhoneOtp("654321")
                .message("Email verified!")
                .build();

        when(registrationService.verifyEmailOtp(any(VerifyEmailOtpRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/auth/registration/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.currentStep").value("PHONE_VERIFICATION"))
                .andExpect(jsonPath("$.data.emailVerified").value(true))
                .andExpect(jsonPath("$.data.demoPhoneOtp").value("654321"));
    }

    @Test
    @DisplayName("POST /api/auth/registration/verify-email returns 400 on invalid code")
    void testVerifyEmailEndpointInvalid() throws Exception {
        VerifyEmailOtpRequest req = new VerifyEmailOtpRequest("test-session-uuid", "000000");

        when(registrationService.verifyEmailOtp(any(VerifyEmailOtpRequest.class)))
                .thenThrow(new IllegalArgumentException("Invalid verification code. 4 attempt(s) remaining."));

        mockMvc.perform(post("/api/auth/registration/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid verification code. 4 attempt(s) remaining."));
    }

    @Test
    @DisplayName("POST /api/auth/registration/verify-phone returns 200 when complete")
    void testVerifyPhoneEndpointSuccess() throws Exception {
        VerifyPhoneOtpRequest req = new VerifyPhoneOtpRequest("test-session-uuid", "654321");

        RegistrationSessionResponse resp = RegistrationSessionResponse.builder()
                .sessionId("test-session-uuid")
                .fullName("Ananya Roy")
                .email("ananya@example.com")
                .phone("+919876543210")
                .currentStep("COMPLETED")
                .emailVerified(true)
                .phoneVerified(true)
                .message("Registration successful!")
                .build();

        when(registrationService.verifyPhoneOtp(any(VerifyPhoneOtpRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/auth/registration/verify-phone")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.currentStep").value("COMPLETED"))
                .andExpect(jsonPath("$.data.emailVerified").value(true))
                .andExpect(jsonPath("$.data.phoneVerified").value(true));
    }

    @Test
    @DisplayName("POST /api/auth/registration/resend-otp enforces cooldown")
    void testResendOtpCooldown() throws Exception {
        ResendOtpRequest req = new ResendOtpRequest("test-session-uuid", "EMAIL");

        when(registrationService.resendOtp(any(ResendOtpRequest.class)))
                .thenThrow(new IllegalArgumentException("Please wait 25 second(s) before requesting a new code."));

        mockMvc.perform(post("/api/auth/registration/resend-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Please wait 25 second(s) before requesting a new code."));
    }
}
