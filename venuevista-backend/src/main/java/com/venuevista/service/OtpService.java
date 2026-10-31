package com.venuevista.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.Locale;

/**
 * Service for generating, hashing, and validating one-time passwords (OTPs)
 * and sanitizing identity inputs (Indian phone numbers and emails).
 */
@Service
public class OtpService {

    private final SecureRandom secureRandom = new SecureRandom();

    private final boolean demoMode;
    private final long expirySeconds;
    private final long cooldownSeconds;
    private final int maxAttempts;

    public OtpService(
            @Value("${venuevista.otp.demo-mode:true}") boolean demoMode,
            @Value("${venuevista.otp.expiry-seconds:300}") long expirySeconds,
            @Value("${venuevista.otp.cooldown-seconds:30}") long cooldownSeconds,
            @Value("${venuevista.otp.max-attempts:5}") int maxAttempts) {
        this.demoMode = demoMode;
        this.expirySeconds = expirySeconds;
        this.cooldownSeconds = cooldownSeconds;
        this.maxAttempts = maxAttempts;
    }

    /**
     * Generates a cryptographically strong 6-digit numeric OTP.
     */
    public String generateSixDigitOtp() {
        int code = secureRandom.nextInt(1_000_000);
        return String.format("%06d", code);
    }

    /**
     * Hashes the raw OTP using SHA-256 with the session ID as a cryptographic salt.
     */
    public String hashOtp(String sessionId, String rawOtp) {
        if (sessionId == null || rawOtp == null) {
            throw new IllegalArgumentException("Session ID and OTP must not be null for hashing");
        }
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            String salted = sessionId + ":" + rawOtp.trim();
            byte[] hashBytes = md.digest(salted.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available in current runtime", e);
        }
    }

    /**
     * Constant-time comparison between raw candidate OTP and stored salted hash.
     */
    public boolean verifyOtp(String sessionId, String rawOtp, String storedHash) {
        if (sessionId == null || rawOtp == null || storedHash == null || rawOtp.isBlank()) {
            return false;
        }
        String candidateHash = hashOtp(sessionId, rawOtp.trim());
        return MessageDigest.isEqual(
                candidateHash.getBytes(StandardCharsets.UTF_8),
                storedHash.getBytes(StandardCharsets.UTF_8)
        );
    }

    /**
     * Normalizes and validates an email address.
     */
    public String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email address is required");
        }
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        if (!normalized.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new IllegalArgumentException("Please provide a valid email address");
        }
        return normalized;
    }

    /**
     * Validates and normalizes an Indian phone number into E.164 standard format (+91XXXXXXXXXX).
     * Accepts formats: +91 98765 43210, 919876543210, 09876543210, 9876543210.
     */
    public String normalizePhoneNumber(String rawPhone) {
        if (rawPhone == null || rawPhone.isBlank()) {
            throw new IllegalArgumentException("Phone number is required");
        }
        String cleaned = rawPhone.replaceAll("[\\s\\-\\(\\)\\.]", "").trim();
        if (cleaned.startsWith("+91")) {
            cleaned = cleaned.substring(3);
        } else if (cleaned.startsWith("91") && cleaned.length() == 12) {
            cleaned = cleaned.substring(2);
        } else if (cleaned.startsWith("0") && cleaned.length() == 11) {
            cleaned = cleaned.substring(1);
        }

        if (!cleaned.matches("^[6-9]\\d{9}$")) {
            throw new IllegalArgumentException("Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9");
        }
        return "+91" + cleaned;
    }

    public boolean isDemoMode() {
        return demoMode;
    }

    public long getExpirySeconds() {
        return expirySeconds;
    }

    public long getCooldownSeconds() {
        return cooldownSeconds;
    }

    public int getMaxAttempts() {
        return maxAttempts;
    }
}
