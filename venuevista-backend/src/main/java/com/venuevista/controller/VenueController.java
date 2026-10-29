package com.venuevista.controller;

import com.venuevista.dto.ApiResponse;
import com.venuevista.dto.VenueCategoryDto;
import com.venuevista.dto.VenueDto;
import com.venuevista.service.VenueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    private final VenueService venueService;

    public VenueController(VenueService venueService) {
        this.venueService = venueService;
    }

    /**
     * List and search venues across India with optional category, city, and text filters.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<VenueDto>>> getVenues(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false, name = "q") String q,
            @RequestParam(required = false, name = "query") String queryParam,
            @RequestParam(required = false, name = "search") String search) {
        String query = q != null ? q : (queryParam != null ? queryParam : search);
        List<VenueDto> venues = venueService.searchVenues(category, city, query);
        return ResponseEntity.ok(ApiResponse.ok(venues));
    }

    /**
     * Retrieve all 6 venue categories with dedicated metadata and counts.
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<VenueCategoryDto>>> getCategories() {
        List<VenueCategoryDto> categories = venueService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    /**
     * Retrieve a specific venue category by slug.
     */
    @GetMapping("/categories/{slug}")
    public ResponseEntity<ApiResponse<VenueCategoryDto>> getCategoryBySlug(@PathVariable String slug) {
        VenueCategoryDto cat = venueService.getCategoryBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(cat));
    }

    /**
     * Retrieve distinct cities where rental venues are located.
     */
    @GetMapping("/cities")
    public ResponseEntity<ApiResponse<List<String>>> getCities() {
        List<String> cities = venueService.getDistinctCities();
        return ResponseEntity.ok(ApiResponse.ok(cities));
    }

    /**
     * Retrieve venue details by numeric database ID or unique code (e.g. ven-101).
     */
    @GetMapping("/{idOrCode}")
    public ResponseEntity<ApiResponse<VenueDto>> getVenueByIdOrCode(@PathVariable String idOrCode) {
        VenueDto venue = venueService.getVenueByIdOrCode(idOrCode);
        return ResponseEntity.ok(ApiResponse.ok(venue));
    }
}
