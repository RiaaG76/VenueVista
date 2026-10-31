package com.venuevista.service;

import com.venuevista.dto.*;
import com.venuevista.entity.RegistrationSession;
import com.venuevista.entity.User;
import com.venuevista.repository.RegistrationSessionRepository;
import com.venuevista.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

    @Mock
    private RegistrationSessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private OtpService otpService;
    private RegistrationService registrationService;

    @BeforeEach
    void setUp() {
        otpService = new OtpService(true, 300L, 30L, 5);
        registrationService = new RegistrationService(sessionRepository, userRepository, passwordEncoder, otpService);
    }

    @Test
    @DisplayName("1. Start registration creates session and generates demo email OTP")
    void testStartRegistrationSuccess() {
        RegistrationStartRequest req = new RegistrationStartRequest(
                "Ananya Roy",
                "ananya@example.com",
                "9876543210",
                "Password@123",
                "Password@123"
        );

        when(userRepository.existsByEmail("ananya@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("+919876543210")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-pwd");
        when(sessionRepository.save(any(RegistrationSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RegistrationSessionResponse resp = registrationService.startRegistration(req);

        assertNotNull(resp.getSessionId());
        assertEquals("EMAIL_VERIFICATION", resp.getCurrentStep());
        assertEquals("ananya@example.com", resp.getEmail());
        assertEquals("+919876543210", resp.getPhone());
        assertNotNull(resp.getDemoEmailOtp());
        assertEquals(6, resp.getDemoEmailOtp().length());
        assertFalse(resp.getEmailVerified());
        assertFalse(resp.getPhoneVerified());
        verify(sessionRepository).save(any(RegistrationSession.class));
    }

    @Test
    @DisplayName("2. Start registration rejects mismatched passwords")
    void testStartRegistrationPasswordMismatch() {
        RegistrationStartRequest req = new RegistrationStartRequest(
                "Ananya Roy",
                "ananya@example.com",
                "9876543210",
                "Password@123",
                "DifferentPassword"
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> registrationService.startRegistration(req));
        assertEquals("Passwords do not match", ex.getMessage());
    }

    @Test
    @DisplayName("3. Start registration rejects duplicate email")
    void testStartRegistrationDuplicateEmail() {
        RegistrationStartRequest req = new RegistrationStartRequest(
                "Ananya Roy",
                "existing@venuevista.in",
                "9876543210",
                "Password@123",
                "Password@123"
        );

        when(userRepository.existsByEmail("existing@venuevista.in")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> registrationService.startRegistration(req));
        assertTrue(ex.getMessage().contains("email address already exists"));
    }

    @Test
    @DisplayName("4. Start registration rejects duplicate phone number")
    void testStartRegistrationDuplicatePhone() {
        RegistrationStartRequest req = new RegistrationStartRequest(
                "Ananya Roy",
                "ananya@example.com",
                "+91 99999 88888",
                "Password@123",
                "Password@123"
        );

        when(userRepository.existsByEmail("ananya@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("+919999988888")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> registrationService.startRegistration(req));
        assertTrue(ex.getMessage().contains("phone number already exists"));
    }

    @Test
    @DisplayName("5. Successful email OTP verification advances to phone verification")
    void testVerifyEmailOtpSuccess() {
        String sessionId = "sess-123";
        String rawOtp = "456789";
        String hash = otpService.hashOtp(sessionId, rawOtp);

        RegistrationSession session = new RegistrationSession();
        session.setSessionId(sessionId);
        session.setFullName("Ananya Roy");
        session.setEmail("ananya@example.com");
        session.setPhone("+919876543210");
        session.setEmailOtpHashed(hash);
        session.setEmailOtpExpiresAt(LocalDateTime.now().plusMinutes(5));
        session.setEmailOtpAttempts(0);
        session.setEmailVerified(false);

        when(sessionRepository.findBySessionId(sessionId)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(RegistrationSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VerifyEmailOtpRequest req = new VerifyEmailOtpRequest(sessionId, rawOtp);
        RegistrationSessionResponse resp = registrationService.verifyEmailOtp(req);

        assertEquals("PHONE_VERIFICATION", resp.getCurrentStep());
        assertTrue(resp.getEmailVerified());
        assertFalse(resp.getPhoneVerified());
        assertNotNull(resp.getDemoPhoneOtp());
        assertEquals(6, resp.getDemoPhoneOtp().length());
        assertNull(session.getEmailOtpHashed(), "Email OTP must be cleared for single-use invalidation");
    }

    @Test
    @DisplayName("6. Incorrect email OTP increments attempts and rejects")
    void testVerifyEmailOtpIncorrect() {
        String sessionId = "sess-123";
        String correctOtp = "456789";
        String hash = otpService.hashOtp(sessionId, correctOtp);

        RegistrationSession session = new RegistrationSession();
        session.setSessionId(sessionId);
        session.setEmailOtpHashed(hash);
        session.setEmailOtpExpiresAt(LocalDateTime.now().plusMinutes(5));
        session.setEmailOtpAttempts(0);
        session.setEmailVerified(false);

        when(sessionRepository.findBySessionId(sessionId)).thenReturn(Optional.of(session));

        VerifyEmailOtpRequest req = new VerifyEmailOtpRequest(sessionId, "000000");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> registrationService.verifyEmailOtp(req));

        assertTrue(ex.getMessage().contains("Invalid verification code"));
        assertEquals(1, session.getEmailOtpAttempts());
    }

    @Test
    @DisplayName("7. Maximum email OTP attempts (5) locks verification")
    void testVerifyEmailOtpMaxAttempts() {
        String sessionId = "sess-123";
        RegistrationSession session = new RegistrationSession();
        session.setSessionId(sessionId);
        session.setEmailOtpAttempts(5);
        session.setEmailVerified(false);

        when(sessionRepository.findBySessionId(sessionId)).thenReturn(Optional.of(session));

        VerifyEmailOtpRequest req = new VerifyEmailOtpRequest(sessionId, "123456");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> registrationService.verifyEmailOtp(req));

        assertTrue(ex.getMessage().contains("Maximum verification attempts exceeded"));
    }

    @Test
    @DisplayName("8. Expired email OTP is rejected")
    void testVerifyEmailOtpExpired() {
        String sessionId = "sess-123";
        String rawOtp = "123456";
        RegistrationSession session = new RegistrationSession();
        session.setSessionId(sessionId);
        session.setEmailOtpHashed(otpService.hashOtp(sessionId, rawOtp));
        session.setEmailOtpExpiresAt(LocalDateTime.now().minusSeconds(10));
        session.setEmailOtpAttempts(0);
        session.setEmailVerified(false);

        when(sessionRepository.findBySessionId(sessionId)).thenReturn(Optional.of(session));

        VerifyEmailOtpRequest req = new VerifyEmailOtpRequest(sessionId, rawOtp);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> registrationService.verifyEmailOtp(req));

        assertTrue(ex.getMessage().contains("has expired"));
    }

    @Test
    @DisplayName("9. Previously used email OTP is rejected")
    void testPreviouslyUsedEmailOtpRejected() {
        String sessionId = "sess-123";
        RegistrationSession session = new RegistrationSession();
        session.setSessionId(sessionId);
        session.setEmailOtpHashed(null); // Already cleared after first use
        session.setEmailOtpExpiresAt(LocalDateTime.now().plusMinutes(5));
        session.setEmailOtpAttempts(0);
        session.setEmailVerified(false);

        when(sessionRepository.findBySessionId(sessionId)).thenReturn(Optional.of(session));

        VerifyEmailOtpRequest req = new VerifyEmailOtpRequest(sessionId, "123456");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> registrationService.verifyEmailOtp(req));

        assertTrue(ex.getMessage().contains("already been used or invalidated"));
    }

    @Test
    @DisplayName("10. Registration blocked before email verification (no User created)")
    void testRegistrationBlockedBeforeEmailVerification() {
        String sessionId = "sess-123";
        RegistrationSession session = new RegistrationSession();
        session.setSessionId(sessionId);
        session.setEmailVerified(false);

        when(sessionRepository.findBySessionId(sessionId)).thenReturn(Optional.of(session));

        VerifyPhoneOtpRequest req = new VerifyPhoneOtpRequest(sessionId, "123456");
        assertThrows(IllegalStateException.class, () -> registrationService.verifyPhoneOtp(req));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("11. Phone verification is blocked if email has not been verified")
    void testVerifyPhoneBlockedBeforeEmail() {
        String sessionId = "sess-123";
        RegistrationSession session = new RegistrationSession();
        session.setSessionId(sessionId);
        session.setEmailVerified(false);

        when(sessionRepository.findBySessionId(sessionId)).thenReturn(Optional.of(session));

        VerifyPhoneOtpRequest req = new VerifyPhoneOtpRequest(sessionId, "123456");
        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> registrationService.verifyPhoneOtp(req));

        assertTrue(ex.getMessage().contains("Email address must be verified"));
    }

    @Test
    @DisplayName("12. Registration blocked before phone verification (User not created until phone verified)")
    void testRegistrationBlockedBeforePhoneVerification() {
        // When email is verified, user repository should not have saved a user yet
        String sessionId = "sess-123";
        String rawEmailOtp = "123456";
        RegistrationSession session = new RegistrationSession();
        session.setSessionId(sessionId);
        session.setEmailOtpHashed(otpService.hashOtp(sessionId, rawEmailOtp));
        session.setEmailOtpExpiresAt(LocalDateTime.now().plusMinutes(5));
        session.setEmailOtpAttempts(0);
        session.setEmailVerified(false);

        when(sessionRepository.findBySessionId(sessionId)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(RegistrationSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        registrationService.verifyEmailOtp(new VerifyEmailOtpRequest(sessionId, rawEmailOtp));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("13. Successful phone verification creates User and deletes session")
    void testVerifyPhoneOtpSuccessCreatesUser() {
        String sessionId = "sess-123";
        String rawPhoneOtp = "789012";
        String hash = otpService.hashOtp(sessionId, rawPhoneOtp);

        RegistrationSession session = new RegistrationSession();
        session.setSessionId(sessionId);
        session.setFullName("Ananya Roy");
        session.setEmail("ananya@example.com");
        session.setPhone("+919876543210");
        session.setPasswordHash("hashed-pwd");
        session.setEmailVerified(true);
        session.setPhoneOtpHashed(hash);
        session.setPhoneOtpExpiresAt(LocalDateTime.now().plusMinutes(5));
        session.setPhoneOtpAttempts(0);
        session.setPhoneVerified(false);

        when(sessionRepository.findBySessionId(sessionId)).thenReturn(Optional.of(session));
        when(userRepository.existsByEmail("ananya@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("+919876543210")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VerifyPhoneOtpRequest req = new VerifyPhoneOtpRequest(sessionId, rawPhoneOtp);
        RegistrationSessionResponse resp = registrationService.verifyPhoneOtp(req);

        assertEquals("COMPLETED", resp.getCurrentStep());
        assertTrue(resp.getEmailVerified());
        assertTrue(resp.getPhoneVerified());
        verify(userRepository).save(argThat(u ->
                u.getEmail().equals("ananya@example.com") &&
                Boolean.TRUE.equals(u.getEmailVerified()) &&
                Boolean.TRUE.equals(u.getPhoneVerified())
        ));
        verify(sessionRepository).delete(session);
    }

    @Test
    @DisplayName("11. Resend OTP enforces 30-second cooldown")
    void testResendOtpCooldown() {
        String sessionId = "sess-123";
        RegistrationSession session = new RegistrationSession();
        session.setSessionId(sessionId);
        session.setEmailVerified(false);
        session.setEmailOtpLastSentAt(LocalDateTime.now().minusSeconds(10)); // Sent 10 seconds ago

        when(sessionRepository.findBySessionId(sessionId)).thenReturn(Optional.of(session));

        ResendOtpRequest req = new ResendOtpRequest(sessionId, "EMAIL");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> registrationService.resendOtp(req));

        assertTrue(ex.getMessage().contains("Please wait") && ex.getMessage().contains("second(s) before requesting a new code"));
    }

    @Test
    @DisplayName("12. Resend OTP succeeds after cooldown period")
    void testResendOtpSuccessAfterCooldown() {
        String sessionId = "sess-123";
        RegistrationSession session = new RegistrationSession();
        session.setSessionId(sessionId);
        session.setEmailVerified(false);
        session.setEmailOtpLastSentAt(LocalDateTime.now().minusSeconds(35)); // Sent 35 seconds ago

        when(sessionRepository.findBySessionId(sessionId)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(RegistrationSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResendOtpRequest req = new ResendOtpRequest(sessionId, "EMAIL");
        RegistrationSessionResponse resp = registrationService.resendOtp(req);

        assertEquals("EMAIL_VERIFICATION", resp.getCurrentStep());
        assertNotNull(resp.getDemoEmailOtp());
        verify(sessionRepository).save(session);
    }

    @Test
    @DisplayName("13. Complete End-to-End Registration: Account created ONLY after both OTPs verified")
    void testCompleteEndToEndDualOtpRegistration() {
        // Step 1: Start registration
        RegistrationStartRequest startReq = new RegistrationStartRequest(
                "Rohan Sen",
                "rohan.sen@example.com",
                "9811122334",
                "Secret@123",
                "Secret@123"
        );

        when(userRepository.existsByEmail("rohan.sen@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("+919811122334")).thenReturn(false);
        when(passwordEncoder.encode("Secret@123")).thenReturn("hashed-secret");

        java.util.concurrent.atomic.AtomicReference<RegistrationSession> savedSessionRef = new java.util.concurrent.atomic.AtomicReference<>();
        when(sessionRepository.save(any(RegistrationSession.class))).thenAnswer(invocation -> {
            RegistrationSession s = invocation.getArgument(0);
            savedSessionRef.set(s);
            return s;
        });

        RegistrationSessionResponse startResp = registrationService.startRegistration(startReq);
        assertNotNull(startResp.getSessionId());
        assertNotNull(startResp.getDemoEmailOtp());
        assertEquals("EMAIL_VERIFICATION", startResp.getCurrentStep());

        // Confirm User is NOT created yet
        verify(userRepository, never()).save(any(User.class));

        // Step 2: Verify Email with returned demo OTP
        RegistrationSession activeSession = savedSessionRef.get();
        when(sessionRepository.findBySessionId(startResp.getSessionId())).thenReturn(Optional.of(activeSession));

        VerifyEmailOtpRequest emailReq = new VerifyEmailOtpRequest(startResp.getSessionId(), startResp.getDemoEmailOtp());
        RegistrationSessionResponse emailResp = registrationService.verifyEmailOtp(emailReq);

        assertTrue(emailResp.getEmailVerified());
        assertFalse(emailResp.getPhoneVerified());
        assertEquals("PHONE_VERIFICATION", emailResp.getCurrentStep());
        assertNotNull(emailResp.getDemoPhoneOtp());

        // Confirm User is STILL NOT created after email verification
        verify(userRepository, never()).save(any(User.class));

        // Step 3: Verify Phone with returned demo OTP
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VerifyPhoneOtpRequest phoneReq = new VerifyPhoneOtpRequest(startResp.getSessionId(), emailResp.getDemoPhoneOtp());
        RegistrationSessionResponse finalResp = registrationService.verifyPhoneOtp(phoneReq);

        assertEquals("COMPLETED", finalResp.getCurrentStep());
        assertTrue(finalResp.getEmailVerified());
        assertTrue(finalResp.getPhoneVerified());

        // Confirm User IS created now, with verified flags true
        verify(userRepository, times(1)).save(argThat(u ->
                u.getEmail().equals("rohan.sen@example.com") &&
                u.getPhone().equals("+919811122334") &&
                Boolean.TRUE.equals(u.getEmailVerified()) &&
                Boolean.TRUE.equals(u.getPhoneVerified())
        ));

        // Confirm session was cleaned up
        verify(sessionRepository).delete(activeSession);
    }
}
