package com.venuevista.dto;

import com.venuevista.entity.Venue;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class VenueDto {

    private String id;
    private Long numericId;
    private String code;
    private String name;
    private String category;
    private String categorySlug;
    private String categoryBadgeClass;
    private String categoryIcon;
    private String location;
    private String city;
    private String capacity;
    private Integer capacityNumber;
    private BigDecimal baseRental;
    private String currency = "INR";
    private String image;
    private String suitableFor;
    private List<String> amenities = new ArrayList<>();
    private boolean isDemo;

    public VenueDto() {
    }

    public VenueDto(Venue venue) {
        if (venue != null) {
            this.id = venue.getCode();
            this.numericId = venue.getId();
            this.code = venue.getCode();
            this.name = venue.getName();
            if (venue.getCategory() != null) {
                this.category = venue.getCategory().getKey();
                this.categorySlug = venue.getCategory().getSlug();
                this.categoryBadgeClass = venue.getCategory().getBadgeClass();
                this.categoryIcon = venue.getCategory().getIcon();
            }
            this.location = venue.getLocation();
            this.city = venue.getCity();
            this.capacity = venue.getCapacity();
            this.capacityNumber = venue.getCapacityNumber();
            this.baseRental = venue.getBaseRental();
            this.currency = venue.getCurrency() != null ? venue.getCurrency() : "INR";
            this.image = venue.getImage();
            this.suitableFor = venue.getSuitableFor();
            if (venue.getAmenities() != null && !venue.getAmenities().isBlank()) {
                this.amenities = Arrays.stream(venue.getAmenities().split("\\s*,\\s*"))
                        .filter(s -> !s.isBlank())
                        .toList();
            }
            this.isDemo = venue.isDemo();
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getNumericId() {
        return numericId;
    }

    public void setNumericId(Long numericId) {
        this.numericId = numericId;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCategorySlug() {
        return categorySlug;
    }

    public void setCategorySlug(String categorySlug) {
        this.categorySlug = categorySlug;
    }

    public String getCategoryBadgeClass() {
        return categoryBadgeClass;
    }

    public void setCategoryBadgeClass(String categoryBadgeClass) {
        this.categoryBadgeClass = categoryBadgeClass;
    }

    public String getCategoryIcon() {
        return categoryIcon;
    }

    public void setCategoryIcon(String categoryIcon) {
        this.categoryIcon = categoryIcon;
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

    public List<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }

    public boolean isDemo() {
        return isDemo;
    }

    public void setDemo(boolean demo) {
        isDemo = demo;
    }
}
