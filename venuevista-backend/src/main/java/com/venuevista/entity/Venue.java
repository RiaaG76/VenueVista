package com.venuevista.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Venue entity representing verified rental spaces across India.
 */
@Entity
@Table(name = "venues", uniqueConstraints = {
    @UniqueConstraint(columnNames = "code")
}, indexes = {
    @Index(name = "idx_venue_city", columnList = "city"),
    @Index(name = "idx_venue_category", columnList = "category_id")
})
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private VenueCategory category;

    @NotBlank
    @Column(nullable = false, length = 200)
    private String location;

    @NotBlank
    @Column(nullable = false, length = 80)
    private String city;

    @Column(nullable = false, length = 80)
    private String capacity;

    @Column(name = "capacity_number")
    private Integer capacityNumber;

    @NotNull
    @Min(0)
    @Column(name = "base_rental", nullable = false, precision = 12, scale = 2)
    private BigDecimal baseRental;

    @Column(nullable = false, length = 10)
    private String currency = "INR";

    @Column(length = 255)
    private String image;

    @Column(name = "suitable_for", length = 255)
    private String suitableFor;

    @Column(columnDefinition = "TEXT")
    private String amenities;

    @Column(name = "is_demo", nullable = false)
    private boolean isDemo = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Venue() {
    }

    public Venue(String code, String name, VenueCategory category, String location,
                 String city, String capacity, Integer capacityNumber, BigDecimal baseRental,
                 String image, String suitableFor, String amenities, boolean isDemo) {
        this.code = code;
        this.name = name;
        this.category = category;
        this.location = location;
        this.city = city;
        this.capacity = capacity;
        this.capacityNumber = capacityNumber;
        this.baseRental = baseRental;
        this.currency = "INR";
        this.image = image;
        this.suitableFor = suitableFor;
        this.amenities = amenities;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public VenueCategory getCategory() {
        return category;
    }

    public void setCategory(VenueCategory category) {
        this.category = category;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCapacity() {
        return capacity;
    }

    public void setCapacity(String capacity) {
        this.capacity = capacity;
    }

    public Integer getCapacityNumber() {
        return capacityNumber;
    }

    public void setCapacityNumber(Integer capacityNumber) {
        this.capacityNumber = capacityNumber;
    }

    public BigDecimal getBaseRental() {
        return baseRental;
    }

    public void setBaseRental(BigDecimal baseRental) {
        this.baseRental = baseRental;
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

    public String getSuitableFor() {
        return suitableFor;
    }

    public void setSuitableFor(String suitableFor) {
        this.suitableFor = suitableFor;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
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
