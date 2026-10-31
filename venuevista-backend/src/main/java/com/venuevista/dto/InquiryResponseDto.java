package com.venuevista.dto;

import com.venuevista.entity.InquiryStatus;
import com.venuevista.entity.VenueInquiry;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class InquiryResponseDto {

    private Long id;
    private String inquiryCode;
    private Long venueId;
    private String venueCode;
    private String venueName;
    private String venueLocation;
    private String venueCity;
    private String contactName;
    private String contactPhoneEmail;
    private String eventType;
    private LocalDate requestedDate;
    private String expectedAttendance;
    private String rentalDuration;
    private BigDecimal estimatedQuote;
    private String currency;
    private InquiryStatus status;
    private LocalDateTime inquiryTime;
    private String notes;

    public InquiryResponseDto() {
    }

    public InquiryResponseDto(VenueInquiry inq) {
        if (inq != null) {
            this.id = inq.getId();
            this.inquiryCode = inq.getInquiryCode();
            if (inq.getVenue() != null) {
                this.venueId = inq.getVenue().getId();
                this.venueCode = inq.getVenue().getCode();
                this.venueName = inq.getVenue().getName();
                this.venueLocation = inq.getVenue().getLocation();
                this.venueCity = inq.getVenue().getCity();
            }
            this.contactName = inq.getContactName();
            this.contactPhoneEmail = inq.getContactPhoneEmail();
            this.eventType = inq.getEventType();
            this.requestedDate = inq.getRequestedDate();
            this.expectedAttendance = inq.getExpectedAttendance();
            this.rentalDuration = inq.getRentalDuration();
            this.estimatedQuote = inq.getEstimatedQuote();
            this.currency = inq.getCurrency();
            this.status = inq.getStatus();
            this.inquiryTime = inq.getInquiryTime();
            this.notes = inq.getNotes();
        }
    }

    /**
     * Sanitizes contact and private note details for unauthorized / guest inquiry lookups.
     */
    public void maskSensitiveDetails() {
        if (this.contactPhoneEmail != null) {
            if (this.contactPhoneEmail.contains("@")) {
                String[] parts = this.contactPhoneEmail.split("@", 2);
                String name = parts[0];
                String masked = name.length() > 2 ? name.substring(0, 2) + "***" : name.charAt(0) + "***";
                this.contactPhoneEmail = masked + "@" + parts[1];
            } else if (this.contactPhoneEmail.length() >= 4) {
                int len = this.contactPhoneEmail.length();
                this.contactPhoneEmail = "******" + this.contactPhoneEmail.substring(len - 4);
            } else {
                this.contactPhoneEmail = "***";
            }
        }
        this.notes = null;
    }

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

    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public String getVenueCode() {
        return venueCode;
    }

    public void setVenueCode(String venueCode) {
        this.venueCode = venueCode;
    }

    public String getVenueName() {
        return venueName;
    }

    public void setVenueName(String venueName) {
        this.venueName = venueName;
    }

    public String getVenueLocation() {
        return venueLocation;
    }

    public void setVenueLocation(String venueLocation) {
        this.venueLocation = venueLocation;
    }

    public String getVenueCity() {
        return venueCity;
    }

    public void setVenueCity(String venueCity) {
        this.venueCity = venueCity;
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
