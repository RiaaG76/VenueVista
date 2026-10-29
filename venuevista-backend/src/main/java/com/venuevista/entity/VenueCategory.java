package com.venuevista.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

/**
 * Venue category classification (e.g. Banquet Halls, Auditoriums, Conference Centres, etc.).
 */
@Entity
@Table(name = "venue_categories", uniqueConstraints = {
    @UniqueConstraint(columnNames = "key_name"),
    @UniqueConstraint(columnNames = "slug")
})
public class VenueCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "key_name", nullable = false, unique = true, length = 50)
    private String key;

    @NotBlank
    @Column(nullable = false, unique = true, length = 60)
    private String slug;

    @Column(nullable = false, length = 100)
    private String path;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 255)
    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 20)
    private String icon;

    @Column(name = "badge_class", length = 50)
    private String badgeClass;

    @Column(length = 255)
    private String image;

    @Column(name = "display_order")
    private int displayOrder = 0;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Venue> venues = new ArrayList<>();

    public VenueCategory() {
    }

    public VenueCategory(String key, String slug, String path, String title, String tagline,
                         String description, String icon, String badgeClass, String image, int displayOrder) {
        this.key = key;
        this.slug = slug;
        this.path = path;
        this.title = title;
        this.tagline = tagline;
        this.description = description;
        this.icon = icon;
        this.badgeClass = badgeClass;
        this.image = image;
        this.displayOrder = displayOrder;
    }

    // Getters and Setters

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

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public List<Venue> getVenues() {
        return venues;
    }

    public void setVenues(List<Venue> venues) {
        this.venues = venues;
    }
}
