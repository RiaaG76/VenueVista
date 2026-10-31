package com.venuevista.service;

import com.venuevista.dto.BookingRequestDto;
import com.venuevista.dto.BookingResponseDto;
import com.venuevista.entity.BookingStatus;
import com.venuevista.entity.Event;
import com.venuevista.entity.EventCategory;
import com.venuevista.entity.Role;
import com.venuevista.entity.TicketBooking;
import com.venuevista.entity.User;
import com.venuevista.repository.EventRepository;
import com.venuevista.repository.TicketBookingRepository;
import com.venuevista.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
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
    private Event sampleEvent;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(bookingRepository, eventRepository, userRepository);

        EventCategory cat = new EventCategory("Music", "music", "/events/music", "Music", "Tagline", "Desc", "🎵", "badge-music", "img.svg", 1);
        sampleEvent = new Event("evt-music-1", "Acoustic Sunsets", cat, "Sat, 14 Nov • 7 PM", LocalDateTime.now(), "NESCO", "Mumbai", new BigDecimal("999.00"), "img.jpg", "Organizer", "Desc", 500, 450, true);
        sampleEvent.setId(101L);
    }

    @Test
    void testCreateBookingSuccess() {
        when(eventRepository.findByCodeForUpdate("evt-music-1")).thenReturn(Optional.of(sampleEvent));
        when(bookingRepository.findByBookingCode(anyString())).thenReturn(Optional.empty());
        when(bookingRepository.findTopByCustomerEmailIgnoreCaseAndEvent_IdAndBookingTimeAfterOrderByBookingTimeDesc(anyString(), eq(101L), any(LocalDateTime.class)))
                .thenReturn(Optional.empty());

        when(bookingRepository.save(any(TicketBooking.class))).thenAnswer(invocation -> invocation.getArgument(0));

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
        assertEquals(448, sampleEvent.getAvailableSeats());
    }

    @Test
    void testCreateBookingInsufficientSeatsThrows() {
        sampleEvent.setAvailableSeats(1);
        when(eventRepository.findByCodeForUpdate("evt-music-1")).thenReturn(Optional.of(sampleEvent));
        when(bookingRepository.findTopByCustomerEmailIgnoreCaseAndEvent_IdAndBookingTimeAfterOrderByBookingTimeDesc(anyString(), eq(101L), any(LocalDateTime.class)))
                .thenReturn(Optional.empty());

        BookingRequestDto req = new BookingRequestDto();
        req.setEventCode("evt-music-1");
        req.setCustomerName("Neha Gupta");
        req.setCustomerEmail("neha@example.com");
        req.setQuantity(2);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> bookingService.createBooking(req, null));
        assertTrue(ex.getMessage().contains("Insufficient seats available"));
        assertEquals(1, sampleEvent.getAvailableSeats());
        verify(bookingRepository, never()).save(any(TicketBooking.class));
    }

    @Test
    void testCreateBookingInvalidQuantityThrows() {
        BookingRequestDto reqLow = new BookingRequestDto();
        reqLow.setEventCode("evt-music-1");
        reqLow.setQuantity(0);

        when(eventRepository.findByCodeForUpdate("evt-music-1")).thenReturn(Optional.of(sampleEvent));
        assertThrows(IllegalArgumentException.class, () -> bookingService.createBooking(reqLow, null));

        BookingRequestDto reqHigh = new BookingRequestDto();
        reqHigh.setEventCode("evt-music-1");
        reqHigh.setQuantity(25);
        assertThrows(IllegalArgumentException.class, () -> bookingService.createBooking(reqHigh, null));
    }

    @Test
    void testCreateBookingRapidDuplicateThrows() {
        when(eventRepository.findByCodeForUpdate("evt-music-1")).thenReturn(Optional.of(sampleEvent));

        TicketBooking recentBooking = new TicketBooking("VV-BK-RECENT", sampleEvent, null, "Rahul Verma", "rahul@example.com",
                "+91 98765 00000", "General", 2, new BigDecimal("999.00"), new BigDecimal("1998.00"), BookingStatus.CONFIRMED, "Recent");

        when(bookingRepository.findTopByCustomerEmailIgnoreCaseAndEvent_IdAndBookingTimeAfterOrderByBookingTimeDesc(
                eq("rahul@example.com"), eq(101L), any(LocalDateTime.class)))
                .thenReturn(Optional.of(recentBooking));

        BookingRequestDto req = new BookingRequestDto();
        req.setEventCode("evt-music-1");
        req.setCustomerName("Rahul Verma");
        req.setCustomerEmail("rahul@example.com");
        req.setQuantity(2);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> bookingService.createBooking(req, null));
        assertTrue(ex.getMessage().contains("Duplicate booking detected"));
        verify(bookingRepository, never()).save(any(TicketBooking.class));
    }

    @Test
    void testGetBookingByCodeOwnerReturnsFullDetails() {
        User user = new User("Aarav Sharma", "aarav@venuevista.in", "hash", "+91 98765 43210", Role.ROLE_USER);
        user.setId(1L);

        TicketBooking booking = new TicketBooking("VV-BK-2026-TEST", sampleEvent, user, "Aarav Sharma",
                "aarav@venuevista.in", "+91 98765 43210", "VIP", 2, new BigDecimal("999.00"),
                new BigDecimal("1998.00"), BookingStatus.CONFIRMED, "Private booking notes");

        when(bookingRepository.findByBookingCode("VV-BK-2026-TEST")).thenReturn(Optional.of(booking));

        BookingResponseDto resp = bookingService.getBookingByCode("VV-BK-2026-TEST", "aarav@venuevista.in", false);
        assertNotNull(resp);
        assertEquals("aarav@venuevista.in", resp.getCustomerEmail());
        assertEquals("+91 98765 43210", resp.getCustomerPhone());
        assertEquals("Private booking notes", resp.getNotes());
    }

    @Test
    void testGetBookingByCodeUnauthorizedUserThrowsAccessDenied() {
        User user = new User("Aarav Sharma", "aarav@venuevista.in", "hash", "+91 98765 43210", Role.ROLE_USER);
        user.setId(1L);

        TicketBooking booking = new TicketBooking("VV-BK-2026-TEST", sampleEvent, user, "Aarav Sharma",
                "aarav@venuevista.in", "+91 98765 43210", "VIP", 2, new BigDecimal("999.00"),
                new BigDecimal("1998.00"), BookingStatus.CONFIRMED, "Private booking notes");

        when(bookingRepository.findByBookingCode("VV-BK-2026-TEST")).thenReturn(Optional.of(booking));

        assertThrows(AccessDeniedException.class, () ->
                bookingService.getBookingByCode("VV-BK-2026-TEST", "stranger@other.com", false));
    }

    @Test
    void testGetBookingByCodeGuestReceiptSanitizesPii() {
        TicketBooking guestBooking = new TicketBooking("VV-BK-2026-GST1", sampleEvent, null, "Guest Customer",
                "guestuser@gmail.com", "+91 98765 43210", "General", 1, new BigDecimal("999.00"),
                new BigDecimal("999.00"), BookingStatus.CONFIRMED, "Secret customer instructions");

        when(bookingRepository.findByBookingCode("VV-BK-2026-GST1")).thenReturn(Optional.of(guestBooking));

        BookingResponseDto receipt = bookingService.getBookingByCode("VV-BK-2026-GST1", null, false);
        assertNotNull(receipt);
        assertEquals("gu***@gmail.com", receipt.getCustomerEmail());
        assertEquals("******3210", receipt.getCustomerPhone());
        assertNull(receipt.getNotes());
        assertEquals("VENUEVISTA:VV-BK-2026-GST1", receipt.getQrCodePayload());
    }

    @Test
    void testConcurrentBookingsOnlyOneSucceeds() throws Exception {
        sampleEvent.setAvailableSeats(1);
        when(eventRepository.findByCodeForUpdate("evt-music-1")).thenReturn(Optional.of(sampleEvent));
        when(bookingRepository.findByBookingCode(anyString())).thenReturn(Optional.empty());
        when(bookingRepository.save(any(TicketBooking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(2);

        for (int i = 0; i < 2; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    startLatch.await();
                    BookingRequestDto req = new BookingRequestDto();
                    req.setEventCode("evt-music-1");
                    req.setCustomerName("Concurrent User " + index);
                    req.setCustomerEmail("user" + index + "@concurrent.com");
                    req.setQuantity(1);

                    bookingService.createBooking(req, null);
                    successCount.incrementAndGet();
                } catch (IllegalStateException e) {
                    failureCount.incrementAndGet();
                } catch (Exception e) {
                    // unexpected
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        boolean finished = doneLatch.await(5, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(finished, "Both threads should finish execution");
        assertEquals(1, successCount.get(), "Exactly one booking must succeed for 1 available seat");
        assertEquals(1, failureCount.get(), "Concurrent second request must be rejected when seats are exhausted");
        assertEquals(0, sampleEvent.getAvailableSeats(), "Remaining seats must be exactly 0");
    }
}
