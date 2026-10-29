package com.venuevista.service;

import com.venuevista.dto.BookingRequestDto;
import com.venuevista.dto.BookingResponseDto;
import com.venuevista.entity.BookingStatus;
import com.venuevista.entity.Event;
import com.venuevista.entity.EventCategory;
import com.venuevista.entity.TicketBooking;
import com.venuevista.repository.EventRepository;
import com.venuevista.repository.TicketBookingRepository;
import com.venuevista.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private TicketBookingRepository bookingRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private UserRepository userRepository;

    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(bookingRepository, eventRepository, userRepository);
    }

    @Test
    void testCreateBookingSuccess() {
        EventCategory cat = new EventCategory("Music", "music", "/events/music", "Music", "Tagline", "Desc", "🎵", "badge-music", "img.svg", 1);
        Event evt = new Event("evt-music-1", "Acoustic Sunsets", cat, "Sat, 14 Nov • 7 PM", LocalDateTime.now(), "NESCO", "Mumbai", new BigDecimal("999.00"), "img.jpg", "Organizer", "Desc", 500, 450, true);

        when(eventRepository.findByCode("evt-music-1")).thenReturn(Optional.of(evt));
        when(bookingRepository.findByBookingCode(anyString())).thenReturn(Optional.empty());

        when(bookingRepository.save(any(TicketBooking.class))).thenAnswer(invocation -> {
            TicketBooking b = invocation.getArgument(0);
            return b;
        });

        BookingRequestDto req = new BookingRequestDto();
        req.setEventCode("evt-music-1");
        req.setCustomerName("Rahul Verma");
        req.setCustomerEmail("rahul@example.com");
        req.setCustomerPhone("+91 98765 00000");
        req.setQuantity(2);
        req.setTicketTier("General Admission");

        BookingResponseDto resp = bookingService.createBooking(req, null);
        assertNotNull(resp);
        assertTrue(resp.getBookingCode().startsWith("VV-BK-2026-"));
        assertEquals("Rahul Verma", resp.getCustomerName());
        assertEquals(2, resp.getQuantity());
        assertEquals(new BigDecimal("1998.00"), resp.getTotalAmount());
        assertEquals(BookingStatus.CONFIRMED, resp.getStatus());
        assertEquals(448, evt.getAvailableSeats());
    }
}
