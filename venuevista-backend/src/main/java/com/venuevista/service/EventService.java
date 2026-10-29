package com.venuevista.service;

import com.venuevista.dto.EventCategoryDto;
import com.venuevista.dto.EventDto;
import com.venuevista.entity.Event;
import com.venuevista.entity.EventCategory;
import com.venuevista.repository.EventCategoryRepository;
import com.venuevista.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class EventService {

    private final EventRepository eventRepository;
    private final EventCategoryRepository categoryRepository;

    public EventService(EventRepository eventRepository, EventCategoryRepository categoryRepository) {
        this.eventRepository = eventRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<EventCategoryDto> getAllCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(cat -> {
                    int count = (int) eventRepository.countByCategory_Slug(cat.getSlug());
                    return new EventCategoryDto(cat, count);
                })
                .toList();
    }

    public EventCategoryDto getCategoryBySlug(String slug) {
        EventCategory cat = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new NoSuchElementException("Event category not found with slug: " + slug));
        int count = (int) eventRepository.countByCategory_Slug(cat.getSlug());
        return new EventCategoryDto(cat, count);
    }

    public List<EventDto> searchEvents(String category, String city, String query) {
        return eventRepository.searchEvents(category, city, query).stream()
                .map(EventDto::new)
                .toList();
    }

    public EventDto getEventByIdOrCode(String idOrCode) {
        Optional<Event> eventOpt = Optional.empty();
        try {
            Long id = Long.parseLong(idOrCode);
            eventOpt = eventRepository.findById(id);
        } catch (NumberFormatException ignored) {
            // Not a numeric ID, search by code
        }

        if (eventOpt.isEmpty()) {
            eventOpt = eventRepository.findByCode(idOrCode);
        }

        Event event = eventOpt.orElseThrow(() ->
                new NoSuchElementException("Event not found with identifier: " + idOrCode));
        return new EventDto(event);
    }

    public List<EventDto> getFeaturedEvents(int limit) {
        return eventRepository.findAll().stream()
                .limit(limit > 0 ? limit : 6)
                .map(EventDto::new)
                .toList();
    }
}
