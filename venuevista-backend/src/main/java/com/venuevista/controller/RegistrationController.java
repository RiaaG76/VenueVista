package com.venuevista.controller;

import com.venuevista.dto.*;
import com.venuevista.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/registration")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<RegistrationSessionResponse>> startRegistration(
            @Valid @RequestBody RegistrationStartRequest request) {
        RegistrationSessionResponse response = registrationService.startRegistration(request);
        return ResponseEntity.ok(ApiResponse.ok(response.getMessage(), response));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<RegistrationSessionResponse>> verifyEmailOtp(
            @Valid @RequestBody VerifyEmailOtpRequest request) {
        RegistrationSessionResponse response = registrationService.verifyEmailOtp(request);
        return ResponseEntity.ok(ApiResponse.ok(response.getMessage(), response));
    }

    @PostMapping("/verify-phone")
    public ResponseEntity<ApiResponse<RegistrationSessionResponse>> verifyPhoneOtp(
            @Valid @RequestBody VerifyPhoneOtpRequest request) {
        RegistrationSessionResponse response = registrationService.verifyPhoneOtp(request);
        return ResponseEntity.ok(ApiResponse.ok(response.getMessage(), response));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<RegistrationSessionResponse>> resendOtp(
            @Valid @RequestBody ResendOtpRequest request) {
        RegistrationSessionResponse response = registrationService.resendOtp(request);
        return ResponseEntity.ok(ApiResponse.ok(response.getMessage(), response));
    }
}
