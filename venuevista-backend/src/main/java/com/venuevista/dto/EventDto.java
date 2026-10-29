package com.venuevista.dto;

import com.venuevista.entity.Event;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class EventDto {

    private String id;
    private Long numericId;
    private String code;
    private String title;
    private String category;
    private String categorySlug;
    private String categoryBadgeClass;
    private String categoryIcon;
    private String dateTime;
    private LocalDateTime eventDate;
    private String venue;
    private String city;
    private BigDecimal startingPrice;
    private String currency = "INR";
    private String image;
    private String organizer;
    private String description;
    private Integer totalSeats;
    private Integer availableSeats;
    private boolean isDemo;

    public EventDto() {
    }

    public EventDto(Event event) {
        if (event != null) {
            this.id = event.getCode();
            this.numericId = event.getId();
            this.code = event.getCode();
            this.title = event.getTitle();
            if (event.getCategory() != null) {
                this.category = event.getCategory().getKey();
                this.categorySlug = event.getCategory().getSlug();
                this.categoryBadgeClass = event.getCategory().getBadgeClass();
                this.categoryIcon = event.getCategory().getIcon();
            }
            this.dateTime = event.getDateTime();
            this.eventDate = event.getEventDate();
            this.venue = event.getVenue();
            this.city = event.getCity();
            this.startingPrice = event.getStartingPrice();
            this.currency = event.getCurrency() != null ? event.getCurrency() : "INR";
            this.image = event.getImage();
            this.organizer = event.getOrganizer();
            this.description = event.getDescription();
            this.totalSeats = event.getTotalSeats();
            this.availableSeats = event.getAvailableSeats();
            this.isDemo = event.isDemo();
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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
}
