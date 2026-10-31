package com.venuevista.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class VerifyEmailOtpRequest {

    @NotBlank(message = "Session ID is required")
    private String sessionId;

    @NotBlank(message = "OTP is required")
    @Pattern(regexp = "^\\d{6}$", message = "OTP must be a 6-digit numeric code")
    private String otp;

    public VerifyEmailOtpRequest() {
    }

    public VerifyEmailOtpRequest(String sessionId, String otp) {
        this.sessionId = sessionId;
        this.otp = otp;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}
