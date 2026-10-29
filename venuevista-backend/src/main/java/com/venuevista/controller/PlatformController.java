package com.venuevista.controller;

import com.venuevista.dto.ApiResponse;
import com.venuevista.dto.PlatformInfoDto;
import com.venuevista.repository.EventCategoryRepository;
import com.venuevista.repository.EventRepository;
import com.venuevista.repository.VenueCategoryRepository;
import com.venuevista.repository.VenueRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/platform")
public class PlatformController {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final EventCategoryRepository eventCategoryRepository;
    private final VenueCategoryRepository venueCategoryRepository;

    public PlatformController(EventRepository eventRepository,
                              VenueRepository venueRepository,
                              EventCategoryRepository eventCategoryRepository,
                              VenueCategoryRepository venueCategoryRepository) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.eventCategoryRepository = eventCategoryRepository;
        this.venueCategoryRepository = venueCategoryRepository;
    }

    @GetMapping("/info")
    public ResponseEntity<ApiResponse<PlatformInfoDto>> getPlatformInfo() {
        PlatformInfoDto dto = new PlatformInfoDto();
        dto.setTotalEvents(eventRepository.count());
        dto.setTotalVenues(venueRepository.count());
        dto.setTotalEventCategories(eventCategoryRepository.count());
        dto.setTotalVenueCategories(venueCategoryRepository.count());
        dto.setSupportedCities(List.of("Mumbai", "New Delhi", "Bengaluru", "Hyderabad", "Pune", "Chennai"));
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealthStatus() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("service", "VenueVista Backend API");
        health.put("timestamp", LocalDateTime.now(ZoneId.of("Asia/Kolkata")).toString());
        health.put("timeZone", "Asia/Kolkata");
        health.put("database", "Connected (MySQL venuevista_db)");
        return ResponseEntity.ok(ApiResponse.ok(health));
    }
}
