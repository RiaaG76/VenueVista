package com.venuevista.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Venue rental inquiry entity for organizer space booking requests.
 */
@Entity
@Table(name = "venue_inquiries", uniqueConstraints = {
    @UniqueConstraint(columnNames = "inquiry_code")
}, indexes = {
    @Index(name = "idx_inquiry_code", columnList = "inquiry_code"),
    @Index(name = "idx_inquiry_venue", columnList = "venue_id")
})
public class VenueInquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "inquiry_code", nullable = false, unique = true, length = 40)
    private String inquiryCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @NotBlank
    @Column(name = "contact_name", nullable = false, length = 120)
    private String contactName;

    @NotBlank
    @Column(name = "contact_phone_email", nullable = false, length = 120)
    private String contactPhoneEmail;

    @NotBlank
    @Column(name = "event_type", nullable = false, length = 80)
    private String eventType;

    @NotNull
    @Column(name = "requested_date", nullable = false)
    private LocalDate requestedDate;

    @Column(name = "expected_attendance", length = 50)
    private String expectedAttendance = "500-1500";

    @Column(name = "rental_duration", length = 50)
    private String rentalDuration = "Full Day (10 Hours)";

    @Column(name = "estimated_quote", precision = 12, scale = 2)
    private BigDecimal estimatedQuote;

    @Column(nullable = false, length = 10)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InquiryStatus status = InquiryStatus.SUBMITTED;

    @Column(name = "inquiry_time", nullable = false)
    private LocalDateTime inquiryTime;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public VenueInquiry() {
    }

    public VenueInquiry(String inquiryCode, Venue venue, User user, String contactName,
                        String contactPhoneEmail, String eventType, LocalDate requestedDate,
                        String expectedAttendance, String rentalDuration, BigDecimal estimatedQuote,
                        InquiryStatus status, String notes) {
        this.inquiryCode = inquiryCode;
        this.venue = venue;
        this.user = user;
        this.contactName = contactName;
        this.contactPhoneEmail = contactPhoneEmail;
        this.eventType = eventType;
        this.requestedDate = requestedDate;
        this.expectedAttendance = expectedAttendance;
        this.rentalDuration = rentalDuration;
        this.estimatedQuote = estimatedQuote;
        this.currency = "INR";
        this.status = status != null ? status : InquiryStatus.SUBMITTED;
        this.inquiryTime = LocalDateTime.now();
        this.notes = notes;
    }

    @PrePersist
    protected void onCreate() {
        if (this.inquiryTime == null) {
            this.inquiryTime = LocalDateTime.now();
        }
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInquiryCode() {
        return inquiryCode;
    }

    public void setInquiryCode(String inquiryCode) {
        this.inquiryCode = inquiryCode;
    }

    public Venue getVenue() {
        return venue;
    }

    public void setVenue(Venue venue) {
        this.venue = venue;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactPhoneEmail() {
        return contactPhoneEmail;
    }

    public void setContactPhoneEmail(String contactPhoneEmail) {
        this.contactPhoneEmail = contactPhoneEmail;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public LocalDate getRequestedDate() {
        return requestedDate;
    }

    public void setRequestedDate(LocalDate requestedDate) {
        this.requestedDate = requestedDate;
    }

    public String getExpectedAttendance() {
        return expectedAttendance;
    }

    public void setExpectedAttendance(String expectedAttendance) {
        this.expectedAttendance = expectedAttendance;
    }

    public String getRentalDuration() {
        return rentalDuration;
    }

    public void setRentalDuration(String rentalDuration) {
        this.rentalDuration = rentalDuration;
    }

    public BigDecimal getEstimatedQuote() {
        return estimatedQuote;
    }

    public void setEstimatedQuote(BigDecimal estimatedQuote) {
        this.estimatedQuote = estimatedQuote;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public InquiryStatus getStatus() {
        return status;
    }

    public void setStatus(InquiryStatus status) {
        this.status = status;
    }

    public LocalDateTime getInquiryTime() {
        return inquiryTime;
    }

    public void setInquiryTime(LocalDateTime inquiryTime) {
        this.inquiryTime = inquiryTime;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
