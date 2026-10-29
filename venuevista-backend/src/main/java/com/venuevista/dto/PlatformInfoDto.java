package com.venuevista.dto;

import java.util.List;

public class PlatformInfoDto {

    private String name = "VenueVista";
    private String version = "0.2.0";
    private String tagline = "Discover events. Find your perfect venue. Two journeys, one destination.";
    private String architecture = "Spring Boot 3.3.5 REST API + Vanilla JS";
    private String locale = "en-IN";
    private String currency = "INR (₹)";
    private String timeZone = "Asia/Kolkata (IST)";
    private List<String> supportedCities;
    private long totalEvents;
    private long totalVenues;
    private long totalEventCategories;
    private long totalVenueCategories;
    private boolean demoMode = true;

    public PlatformInfoDto() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getTagline() {
        return tagline;
    }

    public void setTagline(String tagline) {
        this.tagline = tagline;
    }

    public String getArchitecture() {
        return architecture;
    }

    public void setArchitecture(String architecture) {
        this.architecture = architecture;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }

    public List<String> getSupportedCities() {
        return supportedCities;
    }

    public void setSupportedCities(List<String> supportedCities) {
        this.supportedCities = supportedCities;
    }

    public long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(long totalEvents) {
        this.totalEvents = totalEvents;
    }

    public long getTotalVenues() {
        return totalVenues;
    }

    public void setTotalVenues(long totalVenues) {
        this.totalVenues = totalVenues;
    }

    public long getTotalEventCategories() {
        return totalEventCategories;
    }

    public void setTotalEventCategories(long totalEventCategories) {
        this.totalEventCategories = totalEventCategories;
    }

    public long getTotalVenueCategories() {
        return totalVenueCategories;
    }

    public void setTotalVenueCategories(long totalVenueCategories) {
        this.totalVenueCategories = totalVenueCategories;
    }

    public boolean isDemoMode() {
        return demoMode;
    }

    public void setDemoMode(boolean demoMode) {
        this.demoMode = demoMode;
    }
}
