package com.venuevista.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Event entity for curated live experiences across India.
 */
@Entity
@Table(name = "events", uniqueConstraints = {
    @UniqueConstraint(columnNames = "code")
}, indexes = {
    @Index(name = "idx_event_city", columnList = "city"),
    @Index(name = "idx_event_category", columnList = "category_id")
})
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @NotBlank
    @Column(nullable = false, length = 200)
    private String title;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private EventCategory category;

    @Column(name = "date_time_text", nullable = false, length = 100)
    private String dateTime;

    @Column(name = "event_date")
    private LocalDateTime eventDate;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String venue;

    @NotBlank
    @Column(nullable = false, length = 80)
    private String city;

    @NotNull
    @Min(0)
    @Column(name = "starting_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal startingPrice;

    @Column(nullable = false, length = 10)
    private String currency = "INR";

    @Column(length = 255)
    private String image;

    @Column(length = 150)
    private String organizer;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "total_seats")
    private Integer totalSeats = 500;

    @Column(name = "available_seats")
    private Integer availableSeats = 450;

    @Column(name = "is_demo", nullable = false)
    private boolean isDemo = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Event() {
    }

    public Event(String code, String title, EventCategory category, String dateTime,
                 LocalDateTime eventDate, String venue, String city, BigDecimal startingPrice,
                 String image, String organizer, String description, Integer totalSeats,
                 Integer availableSeats, boolean isDemo) {
        this.code = code;
        this.title = title;
        this.category = category;
        this.dateTime = dateTime;
        this.eventDate = eventDate;
        this.venue = venue;
        this.city = city;
        this.startingPrice = startingPrice;
        this.currency = "INR";
        this.image = image;
        this.organizer = organizer;
        this.description = description;
        this.totalSeats = totalSeats;
        this.availableSeats = availableSeats;
        this.isDemo = isDemo;
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public EventCategory getCategory() {
        return category;
    }

    public void setCategory(EventCategory category) {
        this.category = category;
    }

    public String getDateTime() {
        return dateTime;
    }

    public void setDateTime(String dateTime) {
        this.dateTime = dateTime;
    }

    public LocalDateTime getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public BigDecimal getStartingPrice() {
        return startingPrice;
    }

    public void setStartingPrice(BigDecimal startingPrice) {
        this.startingPrice = startingPrice;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getOrganizer() {
        return organizer;
    }

    public void setOrganizer(String organizer) {
        this.organizer = organizer;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(Integer totalSeats) {
        this.totalSeats = totalSeats;
    }

    public Integer getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(Integer availableSeats) {
        this.availableSeats = availableSeats;
    }

    public boolean isDemo() {
        return isDemo;
    }

    public void setDemo(boolean demo) {
        isDemo = demo;
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
