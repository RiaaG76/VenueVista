package com.venuevista.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ResendOtpRequest {

    @NotBlank(message = "Session ID is required")
    private String sessionId;

    @NotBlank(message = "Target is required (EMAIL or PHONE)")
    @Pattern(regexp = "^(?i)(EMAIL|PHONE)$", message = "Target must be EMAIL or PHONE")
    private String target;

    public ResendOtpRequest() {
    }

    public ResendOtpRequest(String sessionId, String target) {
        this.sessionId = sessionId;
        this.target = target;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }
}
