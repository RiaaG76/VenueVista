package com.venuevista.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Ticket booking entity for event pass reservations.
 */
@Entity
@Table(name = "ticket_bookings", uniqueConstraints = {
    @UniqueConstraint(columnNames = "booking_code")
}, indexes = {
    @Index(name = "idx_booking_code", columnList = "booking_code"),
    @Index(name = "idx_booking_email", columnList = "customer_email")
})
public class TicketBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "booking_code", nullable = false, unique = true, length = 40)
    private String bookingCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @NotBlank
    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @NotBlank
    @Email
    @Column(name = "customer_email", nullable = false, length = 120)
    private String customerEmail;

    @Column(name = "customer_phone", length = 20)
    private String customerPhone;

    @Column(name = "ticket_tier", nullable = false, length = 50)
    private String ticketTier = "General Admission";

    @NotNull
    @Min(1)
    @Column(nullable = false)
    private Integer quantity = 1;

    @NotNull
    @Min(0)
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @NotNull
    @Min(0)
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, length = 10)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private BookingStatus status = BookingStatus.CONFIRMED;

    @Column(name = "booking_time", nullable = false)
    private LocalDateTime bookingTime;

    @Column(length = 255)
    private String notes;

    public TicketBooking() {
    }

    public TicketBooking(String bookingCode, Event event, User user, String customerName,
                         String customerEmail, String customerPhone, String ticketTier,
                         Integer quantity, BigDecimal unitPrice, BigDecimal totalAmount,
                         BookingStatus status, String notes) {
        this.bookingCode = bookingCode;
        this.event = event;
        this.user = user;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.ticketTier = ticketTier;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalAmount = totalAmount;
        this.currency = "INR";
        this.status = status != null ? status : BookingStatus.CONFIRMED;
        this.bookingTime = LocalDateTime.now();
        this.notes = notes;
    }

    @PrePersist
    protected void onCreate() {
        if (this.bookingTime == null) {
            this.bookingTime = LocalDateTime.now();
        }
    }

    // Getters and Setters

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

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
