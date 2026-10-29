package com.venuevista.service;

import com.venuevista.dto.VenueCategoryDto;
import com.venuevista.dto.VenueDto;
import com.venuevista.entity.Venue;
import com.venuevista.entity.VenueCategory;
import com.venuevista.repository.VenueCategoryRepository;
import com.venuevista.repository.VenueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class VenueService {

    private final VenueRepository venueRepository;
    private final VenueCategoryRepository categoryRepository;

    public VenueService(VenueRepository venueRepository, VenueCategoryRepository categoryRepository) {
        this.venueRepository = venueRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<VenueCategoryDto> getAllCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(cat -> {
                    int count = (int) venueRepository.countByCategory_Slug(cat.getSlug());
                    return new VenueCategoryDto(cat, count);
                })
                .toList();
    }

    public VenueCategoryDto getCategoryBySlug(String slug) {
        VenueCategory cat = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new NoSuchElementException("Venue category not found with slug: " + slug));
        int count = (int) venueRepository.countByCategory_Slug(cat.getSlug());
        return new VenueCategoryDto(cat, count);
    }

    public List<VenueDto> searchVenues(String category, String city, String query) {
        return venueRepository.searchVenues(category, city, query).stream()
                .map(VenueDto::new)
                .toList();
    }

    public VenueDto getVenueByIdOrCode(String idOrCode) {
        Optional<Venue> venueOpt = Optional.empty();
        try {
            Long id = Long.parseLong(idOrCode);
            venueOpt = venueRepository.findById(id);
        } catch (NumberFormatException ignored) {
            // Not a numeric ID, search by code
        }

        if (venueOpt.isEmpty()) {
            venueOpt = venueRepository.findByCode(idOrCode);
        }

        Venue venue = venueOpt.orElseThrow(() ->
                new NoSuchElementException("Venue not found with identifier: " + idOrCode));
        return new VenueDto(venue);
    }

    public List<String> getDistinctCities() {
        return venueRepository.findDistinctCities();
    }
}
