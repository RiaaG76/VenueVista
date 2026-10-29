package com.venuevista.dto;

import com.venuevista.entity.BookingStatus;
import com.venuevista.entity.TicketBooking;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BookingResponseDto {

    private Long id;
    private String bookingCode;
    private Long eventId;
    private String eventCode;
    private String eventTitle;
    private String eventDateTime;
    private String eventVenue;
    private String eventCity;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String ticketTier;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private String currency;
    private BookingStatus status;
    private LocalDateTime bookingTime;
    private String qrCodePayload;
    private String notes;

    public BookingResponseDto() {
    }

    public BookingResponseDto(TicketBooking booking) {
        if (booking != null) {
            this.id = booking.getId();
            this.bookingCode = booking.getBookingCode();
            if (booking.getEvent() != null) {
                this.eventId = booking.getEvent().getId();
                this.eventCode = booking.getEvent().getCode();
                this.eventTitle = booking.getEvent().getTitle();
                this.eventDateTime = booking.getEvent().getDateTime();
                this.eventVenue = booking.getEvent().getVenue();
                this.eventCity = booking.getEvent().getCity();
            }
            this.customerName = booking.getCustomerName();
            this.customerEmail = booking.getCustomerEmail();
            this.customerPhone = booking.getCustomerPhone();
            this.ticketTier = booking.getTicketTier();
            this.quantity = booking.getQuantity();
            this.unitPrice = booking.getUnitPrice();
            this.totalAmount = booking.getTotalAmount();
            this.currency = booking.getCurrency();
            this.status = booking.getStatus();
            this.bookingTime = booking.getBookingTime();
            this.qrCodePayload = "VENUEVISTA:" + booking.getBookingCode() + ":" + booking.getCustomerEmail();
            this.notes = booking.getNotes();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBookingCode() {
        return bookingCode;
    }

    public void setBookingCode(String bookingCode) {
        this.bookingCode = bookingCode;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getEventCode() {
        return eventCode;
    }

    public void setEventCode(String eventCode) {
        this.eventCode = eventCode;
    }

    public String getEventTitle() {
        return eventTitle;
    }

    public void setEventTitle(String eventTitle) {
        this.eventTitle = eventTitle;
    }

    public String getEventDateTime() {
        return eventDateTime;
    }

    public void setEventDateTime(String eventDateTime) {
        this.eventDateTime = eventDateTime;
    }

    public String getEventVenue() {
        return eventVenue;
    }

    public void setEventVenue(String eventVenue) {
        this.eventVenue = eventVenue;
    }

    public String getEventCity() {
        return eventCity;
    }

    public void setEventCity(String eventCity) {
        this.eventCity = eventCity;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getTicketTier() {
        return ticketTier;
    }

    public void setTicketTier(String ticketTier) {
        this.ticketTier = ticketTier;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public LocalDateTime getBookingTime() {
        return bookingTime;
    }

    public void setBookingTime(LocalDateTime bookingTime) {
        this.bookingTime = bookingTime;
    }

    public String getQrCodePayload() {
        return qrCodePayload;
    }

    public void setQrCodePayload(String qrCodePayload) {
        this.qrCodePayload = qrCodePayload;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
