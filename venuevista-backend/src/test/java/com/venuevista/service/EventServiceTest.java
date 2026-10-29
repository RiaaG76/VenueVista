package com.venuevista.service;

import com.venuevista.dto.EventDto;
import com.venuevista.entity.Event;
import com.venuevista.entity.EventCategory;
import com.venuevista.repository.EventCategoryRepository;
import com.venuevista.repository.EventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private EventCategoryRepository categoryRepository;

    private EventService eventService;

    @BeforeEach
    void setUp() {
        eventService = new EventService(eventRepository, categoryRepository);
    }

    @Test
    void testSearchEvents() {
        EventCategory cat = new EventCategory("Music", "music", "/events/music", "Music", "Tagline", "Desc", "🎵", "badge-music", "img.svg", 1);
        Event evt = new Event("evt-music-1", "Acoustic Sunsets", cat, "Sat, 14 Nov • 7 PM", LocalDateTime.now(), "NESCO", "Mumbai", new BigDecimal("999.00"), "img.jpg", "Organizer", "Desc", 500, 450, true);

        when(eventRepository.searchEvents("music", "Mumbai", null)).thenReturn(List.of(evt));

        List<EventDto> result = eventService.searchEvents("music", "Mumbai", null);
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("evt-music-1", result.get(0).getId());
        assertEquals("Acoustic Sunsets", result.get(0).getTitle());
    }

    @Test
    void testGetEventByCode() {
        EventCategory cat = new EventCategory("Music", "music", "/events/music", "Music", "Tagline", "Desc", "🎵", "badge-music", "img.svg", 1);
        Event evt = new Event("evt-music-1", "Acoustic Sunsets", cat, "Sat, 14 Nov • 7 PM", LocalDateTime.now(), "NESCO", "Mumbai", new BigDecimal("999.00"), "img.jpg", "Organizer", "Desc", 500, 450, true);

        when(eventRepository.findByCode("evt-music-1")).thenReturn(Optional.of(evt));

        EventDto dto = eventService.getEventByIdOrCode("evt-music-1");
        assertNotNull(dto);
        assertEquals("evt-music-1", dto.getId());
        assertEquals("Mumbai", dto.getCity());
    }
}
