package com.venuevista.controller;

import com.venuevista.dto.ApiResponse;
import com.venuevista.dto.EventCategoryDto;
import com.venuevista.dto.EventDto;
import com.venuevista.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    /**
     * List and search events across India with optional category, city, and text filters.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<EventDto>>> getEvents(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false, name = "q") String q,
            @RequestParam(required = false, name = "query") String queryParam,
            @RequestParam(required = false, name = "search") String search) {
        String query = q != null ? q : (queryParam != null ? queryParam : search);
        List<EventDto> events = eventService.searchEvents(category, city, query);
        return ResponseEntity.ok(ApiResponse.ok(events));
    }

    /**
     * Retrieve featured / spotlight events for the homepage hero carousel.
     */
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<EventDto>>> getFeaturedEvents(
            @RequestParam(defaultValue = "6") int limit) {
        List<EventDto> events = eventService.getFeaturedEvents(limit);
        return ResponseEntity.ok(ApiResponse.ok(events));
    }

    /**
     * Retrieve all 6 event categories with dedicated metadata and counts.
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<EventCategoryDto>>> getCategories() {
        List<EventCategoryDto> categories = eventService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    /**
     * Retrieve a specific event category by slug.
     */
    @GetMapping("/categories/{slug}")
    public ResponseEntity<ApiResponse<EventCategoryDto>> getCategoryBySlug(@PathVariable String slug) {
        EventCategoryDto cat = eventService.getCategoryBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(cat));
    }

    /**
     * Retrieve event details by numeric database ID or unique code (e.g. evt-music-1).
     */
    @GetMapping("/{idOrCode}")
    public ResponseEntity<ApiResponse<EventDto>> getEventByIdOrCode(@PathVariable String idOrCode) {
        EventDto event = eventService.getEventByIdOrCode(idOrCode);
        return ResponseEntity.ok(ApiResponse.ok(event));
    }
}
