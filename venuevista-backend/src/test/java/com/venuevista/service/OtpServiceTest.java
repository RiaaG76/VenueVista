package com.venuevista.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class OtpServiceTest {

    private OtpService otpService;

    @BeforeEach
    void setUp() {
        otpService = new OtpService(true, 300L, 30L, 5);
    }

    @Test
    @DisplayName("Should generate valid 6-digit numeric OTP")
    void testGenerateSixDigitOtp() {
        for (int i = 0; i < 20; i++) {
            String otp = otpService.generateSixDigitOtp();
            assertNotNull(otp);
            assertEquals(6, otp.length());
            assertTrue(otp.matches("^\\d{6}$"), "OTP should be 6 digits: " + otp);
        }
    }

    @Test
    @DisplayName("Should hash OTP using SHA-256 and salt with sessionId")
    void testHashAndVerifyOtp() {
        String sessionId = "test-session-123";
        String otp = "123456";

        String hash1 = otpService.hashOtp(sessionId, otp);
        assertNotNull(hash1);
        assertEquals(64, hash1.length()); // SHA-256 hex string

        // Same session and OTP produces identical hash
        String hash2 = otpService.hashOtp(sessionId, otp);
        assertEquals(hash1, hash2);

        // Verification succeeds with correct OTP
        assertTrue(otpService.verifyOtp(sessionId, otp, hash1));

        // Verification fails with wrong OTP
        assertFalse(otpService.verifyOtp(sessionId, "654321", hash1));

        // Verification fails with wrong sessionId
        assertFalse(otpService.verifyOtp("other-session", otp, hash1));
    }

    @Test
    @DisplayName("Should normalize Indian phone numbers to E.164 format")
    void testNormalizeIndianPhoneNumber() {
        // Plain 10-digit
        assertEquals("+919876543210", otpService.normalizePhoneNumber("9876543210"));

        // With +91 and spaces
        assertEquals("+919876543210", otpService.normalizePhoneNumber("+91 98765 43210"));

        // With dashes and parentheses
        assertEquals("+919876543210", otpService.normalizePhoneNumber("+91-(987)-654-3210"));

        // With leading 0
        assertEquals("+919876543210", otpService.normalizePhoneNumber("09876543210"));

        // With 91 prefix without plus
        assertEquals("+919876543210", otpService.normalizePhoneNumber("919876543210"));

        // Starting with 6, 7, 8, 9
        assertEquals("+916234567890", otpService.normalizePhoneNumber("6234567890"));
        assertEquals("+917234567890", otpService.normalizePhoneNumber("7234567890"));
        assertEquals("+918234567890", otpService.normalizePhoneNumber("8234567890"));
    }

    @Test
    @DisplayName("Should reject invalid phone numbers")
    void testRejectInvalidPhoneNumbers() {
        // Less than 10 digits
        assertThrows(IllegalArgumentException.class, () -> otpService.normalizePhoneNumber("987654321"));

        // Starting with invalid digit 1-5
        assertThrows(IllegalArgumentException.class, () -> otpService.normalizePhoneNumber("5876543210"));
        assertThrows(IllegalArgumentException.class, () -> otpService.normalizePhoneNumber("+91 48765 43210"));

        // Blank or null
        assertThrows(IllegalArgumentException.class, () -> otpService.normalizePhoneNumber(""));
        assertThrows(IllegalArgumentException.class, () -> otpService.normalizePhoneNumber(null));
    }

    @Test
    @DisplayName("Should normalize and validate email addresses")
    void testNormalizeEmail() {
        assertEquals("user@example.com", otpService.normalizeEmail("  USER@Example.COM "));
        assertEquals("rahul.sharma@domain.in", otpService.normalizeEmail("rahul.sharma@domain.in"));

        assertThrows(IllegalArgumentException.class, () -> otpService.normalizeEmail("invalid-email"));
        assertThrows(IllegalArgumentException.class, () -> otpService.normalizeEmail("user@.com"));
        assertThrows(IllegalArgumentException.class, () -> otpService.normalizeEmail(""));
        assertThrows(IllegalArgumentException.class, () -> otpService.normalizeEmail(null));
    }
}
