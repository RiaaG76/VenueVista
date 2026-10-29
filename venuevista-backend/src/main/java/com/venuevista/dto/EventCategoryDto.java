package com.venuevista.dto;

import com.venuevista.entity.EventCategory;

public class EventCategoryDto {

    private Long id;
    private String key;
    private String slug;
    private String path;
    private String title;
    private String tagline;
    private String description;
    private String icon;
    private String badgeClass;
    private String image;
    private int eventCount;

    public EventCategoryDto() {
    }

    public EventCategoryDto(EventCategory cat, int eventCount) {
        if (cat != null) {
            this.id = cat.getId();
            this.key = cat.getKey();
            this.slug = cat.getSlug();
            this.path = cat.getPath();
            this.title = cat.getTitle();
            this.tagline = cat.getTagline();
            this.description = cat.getDescription();
            this.icon = cat.getIcon();
            this.badgeClass = cat.getBadgeClass();
            this.image = cat.getImage();
            this.eventCount = eventCount;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTagline() {
        return tagline;
    }

    public void setTagline(String tagline) {
        this.tagline = tagline;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getBadgeClass() {
        return badgeClass;
    }

    public void setBadgeClass(String badgeClass) {
        this.badgeClass = badgeClass;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public int getEventCount() {
        return eventCount;
    }

    public void setEventCount(int eventCount) {
        this.eventCount = eventCount;
    }
}
