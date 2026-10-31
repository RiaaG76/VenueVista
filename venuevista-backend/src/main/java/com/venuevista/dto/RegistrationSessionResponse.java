package com.venuevista.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class RegistrationSessionResponse {

    private String sessionId;
    private String fullName;
    private String email;
    private String phone;
    private String currentStep;
    private Boolean emailVerified;
    private Boolean phoneVerified;
    private Long resendCooldownSeconds;
    private Long expiresInSeconds;
    private String demoEmailOtp;
    private String demoPhoneOtp;
    private Boolean demoMode;
    private String message;

    public RegistrationSessionResponse() {
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final RegistrationSessionResponse response = new RegistrationSessionResponse();

        public Builder sessionId(String sessionId) {
            response.sessionId = sessionId;
            return this;
        }

        public Builder fullName(String fullName) {
            response.fullName = fullName;
            return this;
        }

        public Builder email(String email) {
            response.email = email;
            return this;
        }

        public Builder phone(String phone) {
            response.phone = phone;
            return this;
        }

        public Builder currentStep(String currentStep) {
            response.currentStep = currentStep;
            return this;
        }

        public Builder emailVerified(Boolean emailVerified) {
            response.emailVerified = emailVerified;
            return this;
        }

        public Builder phoneVerified(Boolean phoneVerified) {
            response.phoneVerified = phoneVerified;
            return this;
        }

        public Builder resendCooldownSeconds(Long resendCooldownSeconds) {
            response.resendCooldownSeconds = resendCooldownSeconds;
            return this;
        }

        public Builder expiresInSeconds(Long expiresInSeconds) {
            response.expiresInSeconds = expiresInSeconds;
            return this;
        }

        public Builder demoEmailOtp(String demoEmailOtp) {
            response.demoEmailOtp = demoEmailOtp;
            return this;
        }

        public Builder demoPhoneOtp(String demoPhoneOtp) {
            response.demoPhoneOtp = demoPhoneOtp;
            return this;
        }

        public Builder demoMode(Boolean demoMode) {
            response.demoMode = demoMode;
            return this;
        }

        public Builder message(String message) {
            response.message = message;
            return this;
        }

        public RegistrationSessionResponse build() {
            return response;
        }
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCurrentStep() {
        return currentStep;
    }

    public void setCurrentStep(String currentStep) {
        this.currentStep = currentStep;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public Boolean getPhoneVerified() {
        return phoneVerified;
    }

    public void setPhoneVerified(Boolean phoneVerified) {
        this.phoneVerified = phoneVerified;
    }

    public Long getResendCooldownSeconds() {
        return resendCooldownSeconds;
    }

    public void setResendCooldownSeconds(Long resendCooldownSeconds) {
        this.resendCooldownSeconds = resendCooldownSeconds;
    }

    public Long getExpiresInSeconds() {
        return expiresInSeconds;
    }

    public void setExpiresInSeconds(Long expiresInSeconds) {
        this.expiresInSeconds = expiresInSeconds;
    }

    public String getDemoEmailOtp() {
        return demoEmailOtp;
    }

    public void setDemoEmailOtp(String demoEmailOtp) {
        this.demoEmailOtp = demoEmailOtp;
    }

    public String getDemoPhoneOtp() {
        return demoPhoneOtp;
    }

    public void setDemoPhoneOtp(String demoPhoneOtp) {
        this.demoPhoneOtp = demoPhoneOtp;
    }

    public Boolean getDemoMode() {
        return demoMode;
    }

    public void setDemoMode(Boolean demoMode) {
        this.demoMode = demoMode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
