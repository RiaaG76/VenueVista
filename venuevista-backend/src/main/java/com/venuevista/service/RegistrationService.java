package com.venuevista.service;

import com.venuevista.dto.*;
import com.venuevista.entity.RegistrationSession;
import com.venuevista.entity.Role;
import com.venuevista.entity.User;
import com.venuevista.repository.RegistrationSessionRepository;
import com.venuevista.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class RegistrationService {

    private static final Logger log = LoggerFactory.getLogger(RegistrationService.class);

    private final RegistrationSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    public RegistrationService(
            RegistrationSessionRepository sessionRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            OtpService otpService) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
    }

    /**
     * Step 1: Start registration. Validates input, checks duplicate email and phone,
     * creates an active verification session, generates an email OTP, and returns session state.
     */
    @Transactional
    public RegistrationSessionResponse startRegistration(RegistrationStartRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        String normalizedEmail = otpService.normalizeEmail(request.getEmail());
        String normalizedPhone = otpService.normalizePhoneNumber(request.getPhone());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("An account with this email address already exists");
        }
        if (userRepository.existsByPhone(normalizedPhone)) {
            throw new IllegalArgumentException("An account with this phone number already exists");
        }

        // Clean up any stale/abandoned registration sessions for the same email or phone
        sessionRepository.findByEmail(normalizedEmail).ifPresent(sessionRepository::delete);
        sessionRepository.findByPhone(normalizedPhone).ifPresent(sessionRepository::delete);

        String sessionId = UUID.randomUUID().toString();
        String rawEmailOtp = otpService.generateSixDigitOtp();
        String hashedEmailOtp = otpService.hashOtp(sessionId, rawEmailOtp);

        RegistrationSession session = new RegistrationSession();
        session.setSessionId(sessionId);
        session.setFullName(request.getName().trim());
        session.setEmail(normalizedEmail);
        session.setPhone(normalizedPhone);
        session.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        session.setEmailOtpHashed(hashedEmailOtp);
        session.setEmailOtpExpiresAt(LocalDateTime.now().plusSeconds(otpService.getExpirySeconds()));
        session.setEmailOtpLastSentAt(LocalDateTime.now());
        session.setEmailOtpAttempts(0);
        session.setEmailVerified(false);
        session.setPhoneVerified(false);
        session.setPhoneOtpAttempts(0);

        sessionRepository.save(session);
        log.info("Started registration session for email [MASKED] and phone [MASKED]");

        return RegistrationSessionResponse.builder()
                .sessionId(sessionId)
                .fullName(session.getFullName())
                .email(session.getEmail())
                .phone(session.getPhone())
                .currentStep("EMAIL_VERIFICATION")
                .emailVerified(false)
                .phoneVerified(false)
                .resendCooldownSeconds(otpService.getCooldownSeconds())
                .expiresInSeconds(otpService.getExpirySeconds())
                .demoMode(otpService.isDemoMode())
                .demoEmailOtp(otpService.isDemoMode() ? rawEmailOtp : null)
                .message("Demo verification code generated for email. Please verify to continue.")
                .build();
    }

    /**
     * Step 2: Verify email OTP.
     * Enforces attempt limit, expiration, single-use invalidation.
     * Upon success, generates phone OTP and transitions to phone verification.
     */
    @Transactional
    public RegistrationSessionResponse verifyEmailOtp(VerifyEmailOtpRequest request) {
        RegistrationSession session = sessionRepository.findBySessionId(request.getSessionId())
                .orElseThrow(() -> new NoSuchElementException("Registration session not found or expired. Please start over."));

        if (Boolean.TRUE.equals(session.getEmailVerified())) {
            // Already verified, return current state
            return buildSessionResponse(session, null, null, "Email is already verified. Please verify your phone number.");
        }

        if (session.getEmailOtpAttempts() >= otpService.getMaxAttempts()) {
            throw new IllegalArgumentException("Maximum verification attempts exceeded. Please request a new OTP.");
        }

        if (session.getEmailOtpExpiresAt() == null || LocalDateTime.now().isAfter(session.getEmailOtpExpiresAt())) {
            throw new IllegalArgumentException("Email verification code has expired. Please request a new OTP.");
        }

        if (session.getEmailOtpHashed() == null) {
            throw new IllegalArgumentException("Verification code has already been used or invalidated. Please request a new OTP.");
        }

        boolean valid = otpService.verifyOtp(session.getSessionId(), request.getOtp(), session.getEmailOtpHashed());
        if (!valid) {
            session.setEmailOtpAttempts(session.getEmailOtpAttempts() + 1);
            sessionRepository.save(session);
            int remainingAttempts = otpService.getMaxAttempts() - session.getEmailOtpAttempts();
            if (remainingAttempts <= 0) {
                throw new IllegalArgumentException("Invalid verification code. Maximum attempts reached. Please request a new OTP.");
            }
            throw new IllegalArgumentException("Invalid verification code. " + remainingAttempts + " attempt(s) remaining.");
        }

        // Email verified successfully - invalidate email OTP (single-use)
        session.setEmailVerified(true);
        session.setEmailOtpHashed(null);

        // Generate phone OTP automatically for seamless step 2
        String rawPhoneOtp = otpService.generateSixDigitOtp();
        String hashedPhoneOtp = otpService.hashOtp(session.getSessionId(), rawPhoneOtp);
        session.setPhoneOtpHashed(hashedPhoneOtp);
        session.setPhoneOtpExpiresAt(LocalDateTime.now().plusSeconds(otpService.getExpirySeconds()));
        session.setPhoneOtpLastSentAt(LocalDateTime.now());
        session.setPhoneOtpAttempts(0);

        sessionRepository.save(session);
        log.info("Email verified successfully for session: {}", session.getSessionId());

        return RegistrationSessionResponse.builder()
                .sessionId(session.getSessionId())
                .fullName(session.getFullName())
                .email(session.getEmail())
                .phone(session.getPhone())
                .currentStep("PHONE_VERIFICATION")
                .emailVerified(true)
                .phoneVerified(false)
                .resendCooldownSeconds(otpService.getCooldownSeconds())
                .expiresInSeconds(otpService.getExpirySeconds())
                .demoMode(otpService.isDemoMode())
                .demoPhoneOtp(otpService.isDemoMode() ? rawPhoneOtp : null)
                .message("Email verified! Demo verification code generated for your phone number.")
                .build();
    }

    /**
     * Step 3: Verify phone OTP.
     * Enforces prerequisite email verification, attempt limit, expiration, single-use invalidation.
     * Upon success, creates the permanent User account and deletes the transient session.
     */
    @Transactional
    public RegistrationSessionResponse verifyPhoneOtp(VerifyPhoneOtpRequest request) {
        RegistrationSession session = sessionRepository.findBySessionId(request.getSessionId())
                .orElseThrow(() -> new NoSuchElementException("Registration session not found or expired. Please start over."));

        if (!Boolean.TRUE.equals(session.getEmailVerified())) {
            throw new IllegalStateException("Email address must be verified before verifying phone number.");
        }

        if (session.getPhoneOtpAttempts() >= otpService.getMaxAttempts()) {
            throw new IllegalArgumentException("Maximum verification attempts exceeded. Please request a new OTP.");
        }

        if (session.getPhoneOtpExpiresAt() == null || LocalDateTime.now().isAfter(session.getPhoneOtpExpiresAt())) {
            throw new IllegalArgumentException("Phone verification code has expired. Please request a new OTP.");
        }

        if (session.getPhoneOtpHashed() == null) {
            throw new IllegalArgumentException("Verification code has already been used or invalidated. Please request a new OTP.");
        }

        boolean valid = otpService.verifyOtp(session.getSessionId(), request.getOtp(), session.getPhoneOtpHashed());
        if (!valid) {
            session.setPhoneOtpAttempts(session.getPhoneOtpAttempts() + 1);
            sessionRepository.save(session);
            int remainingAttempts = otpService.getMaxAttempts() - session.getPhoneOtpAttempts();
            if (remainingAttempts <= 0) {
                throw new IllegalArgumentException("Invalid verification code. Maximum attempts reached. Please request a new OTP.");
            }
            throw new IllegalArgumentException("Invalid verification code. " + remainingAttempts + " attempt(s) remaining.");
        }

        // Phone verified successfully
        session.setPhoneVerified(true);
        session.setPhoneOtpHashed(null);

        // Final duplicate check right before user insertion
        if (userRepository.existsByEmail(session.getEmail())) {
            throw new IllegalArgumentException("An account with this email address already exists.");
        }
        if (userRepository.existsByPhone(session.getPhone())) {
            throw new IllegalArgumentException("An account with this phone number already exists.");
        }

        User user = new User(
                session.getFullName(),
                session.getEmail(),
                session.getPasswordHash(),
                session.getPhone(),
                Role.ROLE_USER
        );
        user.setEmailVerified(true);
        user.setPhoneVerified(true);
        userRepository.save(user);

        // Remove transient registration session
        sessionRepository.delete(session);
        log.info("Dual OTP registration completed successfully for new user: {}", user.getEmail());

        return RegistrationSessionResponse.builder()
                .sessionId(session.getSessionId())
                .fullName(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .currentStep("COMPLETED")
                .emailVerified(true)
                .phoneVerified(true)
                .demoMode(otpService.isDemoMode())
                .message("Registration successful! Your email and phone have both been verified. You may now sign in.")
                .build();
    }

    /**
     * Resend OTP for email or phone with 30-second cooldown enforcement.
     */
    @Transactional
    public RegistrationSessionResponse resendOtp(ResendOtpRequest request) {
        RegistrationSession session = sessionRepository.findBySessionId(request.getSessionId())
                .orElseThrow(() -> new NoSuchElementException("Registration session not found or expired. Please start over."));

        String target = request.getTarget().toUpperCase();
        LocalDateTime now = LocalDateTime.now();

        if ("EMAIL".equals(target)) {
            if (Boolean.TRUE.equals(session.getEmailVerified())) {
                throw new IllegalArgumentException("Email address is already verified.");
            }
            if (session.getEmailOtpLastSentAt() != null) {
                long elapsed = Duration.between(session.getEmailOtpLastSentAt(), now).getSeconds();
                if (elapsed < otpService.getCooldownSeconds()) {
                    long remaining = otpService.getCooldownSeconds() - elapsed;
                    throw new IllegalArgumentException("Please wait " + remaining + " second(s) before requesting a new code.");
                }
            }

            String newOtp = otpService.generateSixDigitOtp();
            session.setEmailOtpHashed(otpService.hashOtp(session.getSessionId(), newOtp));
            session.setEmailOtpExpiresAt(now.plusSeconds(otpService.getExpirySeconds()));
            session.setEmailOtpLastSentAt(now);
            session.setEmailOtpAttempts(0);
            sessionRepository.save(session);

            return RegistrationSessionResponse.builder()
                    .sessionId(session.getSessionId())
                    .fullName(session.getFullName())
                    .email(session.getEmail())
                    .phone(session.getPhone())
                    .currentStep("EMAIL_VERIFICATION")
                    .emailVerified(false)
                    .phoneVerified(false)
                    .resendCooldownSeconds(otpService.getCooldownSeconds())
                    .expiresInSeconds(otpService.getExpirySeconds())
                    .demoMode(otpService.isDemoMode())
                    .demoEmailOtp(otpService.isDemoMode() ? newOtp : null)
                    .message("A new demo email verification code has been generated.")
                    .build();

        } else if ("PHONE".equals(target)) {
            if (!Boolean.TRUE.equals(session.getEmailVerified())) {
                throw new IllegalStateException("Email address must be verified before requesting a phone verification code.");
            }
            if (Boolean.TRUE.equals(session.getPhoneVerified())) {
                throw new IllegalArgumentException("Phone number is already verified.");
            }
            if (session.getPhoneOtpLastSentAt() != null) {
                long elapsed = Duration.between(session.getPhoneOtpLastSentAt(), now).getSeconds();
                if (elapsed < otpService.getCooldownSeconds()) {
                    long remaining = otpService.getCooldownSeconds() - elapsed;
                    throw new IllegalArgumentException("Please wait " + remaining + " second(s) before requesting a new code.");
                }
            }

            String newOtp = otpService.generateSixDigitOtp();
            session.setPhoneOtpHashed(otpService.hashOtp(session.getSessionId(), newOtp));
            session.setPhoneOtpExpiresAt(now.plusSeconds(otpService.getExpirySeconds()));
            session.setPhoneOtpLastSentAt(now);
            session.setPhoneOtpAttempts(0);
            sessionRepository.save(session);

            return RegistrationSessionResponse.builder()
                    .sessionId(session.getSessionId())
                    .fullName(session.getFullName())
                    .email(session.getEmail())
                    .phone(session.getPhone())
                    .currentStep("PHONE_VERIFICATION")
                    .emailVerified(true)
                    .phoneVerified(false)
                    .resendCooldownSeconds(otpService.getCooldownSeconds())
                    .expiresInSeconds(otpService.getExpirySeconds())
                    .demoMode(otpService.isDemoMode())
                    .demoPhoneOtp(otpService.isDemoMode() ? newOtp : null)
                    .message("A new demo phone verification code has been generated.")
                    .build();
        } else {
            throw new IllegalArgumentException("Invalid resend target: " + target + ". Must be EMAIL or PHONE.");
        }
    }

    private RegistrationSessionResponse buildSessionResponse(
            RegistrationSession session,
            String demoEmailOtp,
            String demoPhoneOtp,
            String message) {
        String currentStep = !Boolean.TRUE.equals(session.getEmailVerified()) ? "EMAIL_VERIFICATION"
                : (!Boolean.TRUE.equals(session.getPhoneVerified()) ? "PHONE_VERIFICATION" : "COMPLETED");

        return RegistrationSessionResponse.builder()
                .sessionId(session.getSessionId())
                .fullName(session.getFullName())
                .email(session.getEmail())
                .phone(session.getPhone())
                .currentStep(currentStep)
                .emailVerified(session.getEmailVerified())
                .phoneVerified(session.getPhoneVerified())
                .resendCooldownSeconds(otpService.getCooldownSeconds())
                .expiresInSeconds(otpService.getExpirySeconds())
                .demoMode(otpService.isDemoMode())
                .demoEmailOtp(otpService.isDemoMode() ? demoEmailOtp : null)
                .demoPhoneOtp(otpService.isDemoMode() ? demoPhoneOtp : null)
                .message(message)
                .build();
    }
}
