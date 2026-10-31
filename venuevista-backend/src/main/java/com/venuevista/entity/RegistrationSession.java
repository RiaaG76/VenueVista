package com.venuevista.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Transient verification entity for tracking dual-OTP registration workflows.
 * Stores cryptographically hashed OTPs and validates separate email and phone verification steps.
 */
@Entity
@Table(name = "registration_sessions", indexes = {
    @Index(name = "idx_reg_session_id", columnList = "sessionId", unique = true),
    @Index(name = "idx_reg_email", columnList = "email"),
    @Index(name = "idx_reg_phone", columnList = "phone")
})
public class RegistrationSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String sessionId;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(nullable = false, length = 255)
    private String passwordHash;

    @Column(length = 100)
    private String emailOtpHashed;

    private LocalDateTime emailOtpExpiresAt;

    private LocalDateTime emailOtpLastSentAt;

    @Column(nullable = false)
    private Integer emailOtpAttempts = 0;

    @Column(nullable = false)
    private Boolean emailVerified = false;

    @Column(length = 100)
    private String phoneOtpHashed;

    private LocalDateTime phoneOtpExpiresAt;

    private LocalDateTime phoneOtpLastSentAt;

    @Column(nullable = false)
    private Integer phoneOtpAttempts = 0;

    @Column(nullable = false)
    private Boolean phoneVerified = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public RegistrationSession() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getEmailOtpHashed() {
        return emailOtpHashed;
    }

    public void setEmailOtpHashed(String emailOtpHashed) {
        this.emailOtpHashed = emailOtpHashed;
    }

    public LocalDateTime getEmailOtpExpiresAt() {
        return emailOtpExpiresAt;
    }

    public void setEmailOtpExpiresAt(LocalDateTime emailOtpExpiresAt) {
        this.emailOtpExpiresAt = emailOtpExpiresAt;
    }

    public LocalDateTime getEmailOtpLastSentAt() {
        return emailOtpLastSentAt;
    }

    public void setEmailOtpLastSentAt(LocalDateTime emailOtpLastSentAt) {
        this.emailOtpLastSentAt = emailOtpLastSentAt;
    }

    public Integer getEmailOtpAttempts() {
        return emailOtpAttempts;
    }

    public void setEmailOtpAttempts(Integer emailOtpAttempts) {
        this.emailOtpAttempts = emailOtpAttempts;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getPhoneOtpHashed() {
        return phoneOtpHashed;
    }

    public void setPhoneOtpHashed(String phoneOtpHashed) {
        this.phoneOtpHashed = phoneOtpHashed;
    }

    public LocalDateTime getPhoneOtpExpiresAt() {
        return phoneOtpExpiresAt;
    }

    public void setPhoneOtpExpiresAt(LocalDateTime phoneOtpExpiresAt) {
        this.phoneOtpExpiresAt = phoneOtpExpiresAt;
    }

    public LocalDateTime getPhoneOtpLastSentAt() {
        return phoneOtpLastSentAt;
    }

    public void setPhoneOtpLastSentAt(LocalDateTime phoneOtpLastSentAt) {
        this.phoneOtpLastSentAt = phoneOtpLastSentAt;
    }

    public Integer getPhoneOtpAttempts() {
        return phoneOtpAttempts;
    }

    public void setPhoneOtpAttempts(Integer phoneOtpAttempts) {
        this.phoneOtpAttempts = phoneOtpAttempts;
    }

    public Boolean getPhoneVerified() {
        return phoneVerified;
    }

    public void setPhoneVerified(Boolean phoneVerified) {
        this.phoneVerified = phoneVerified;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
