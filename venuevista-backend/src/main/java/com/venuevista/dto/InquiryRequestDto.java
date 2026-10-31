package com.venuevista.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class InquiryRequestDto {

    private Long venueId;
    private String venueCode;

    @NotBlank(message = "Contact name / organization is required")
    private String contactName;

    @NotBlank(message = "Contact phone or email is required")
    private String contactPhoneEmail;

    @NotBlank(message = "Event type is required")
    private String eventType = "Concert";

    @NotNull(message = "Requested date is required")
    @FutureOrPresent(message = "Requested date must be today or in the future")
    private LocalDate requestedDate;

    @NotBlank(message = "Expected attendance is required")
    private String expectedAttendance = "500-1500";

    @NotBlank(message = "Rental duration is required")
    private String rentalDuration = "Full Day (10 Hours)";

    private String notes;

    public InquiryRequestDto() {
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
