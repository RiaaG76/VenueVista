package com.venuevista.service;

import com.venuevista.dto.InquiryRequestDto;
import com.venuevista.dto.InquiryResponseDto;
import com.venuevista.entity.*;
import com.venuevista.repository.UserRepository;
import com.venuevista.repository.VenueInquiryRepository;
import com.venuevista.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InquiryServiceTest {

    @Mock
    private VenueInquiryRepository inquiryRepository;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private UserRepository userRepository;

    private InquiryService inquiryService;
    private Venue sampleVenue;

    @BeforeEach
    void setUp() {
        inquiryService = new InquiryService(inquiryRepository, venueRepository, userRepository);

        VenueCategory cat = new VenueCategory("Convention", "convention-halls", "/venues/convention-halls",
                "Convention", "Tagline", "Desc", "🏛️", "badge-convention", "img.svg", 1);
        sampleVenue = new Venue("ven-101", "Bharat Mandapam", cat, "New Delhi", "Pragati Maidan",
                "10,000 capacity", 10000, new BigDecimal("250000.00"), "img.jpg", "Conferences", "WiFi, AC", true);
        sampleVenue.setId(501L);
    }

    @Test
    void testCreateInquirySuccess() {
        when(venueRepository.findByCode("ven-101")).thenReturn(Optional.of(sampleVenue));
        when(inquiryRepository.findTopByContactPhoneEmailIgnoreCaseAndVenue_IdAndInquiryTimeAfterOrderByInquiryTimeDesc(
                anyString(), eq(501L), any(LocalDateTime.class)))
                .thenReturn(Optional.empty());
        when(inquiryRepository.findByInquiryCode(anyString())).thenReturn(Optional.empty());
        when(inquiryRepository.save(any(VenueInquiry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InquiryRequestDto req = new InquiryRequestDto();
        req.setVenueCode("ven-101");
        req.setContactName("Vikram Singhania");
        req.setContactPhoneEmail("+91 98111 22334");
        req.setEventType("Global Tech Summit");
        req.setRequestedDate(LocalDate.now().plusDays(30));
        req.setRentalDuration("Full Day (10 Hours)");
        req.setExpectedAttendance("500-1500");

        InquiryResponseDto resp = inquiryService.createInquiry(req, null);
        assertNotNull(resp);
        assertTrue(resp.getInquiryCode().startsWith("VV-INQ-2026-"));
        assertEquals("Vikram Singhania", resp.getContactName());
        assertEquals(new BigDecimal("250000.00"), resp.getEstimatedQuote());
        assertEquals(InquiryStatus.SUBMITTED, resp.getStatus());
    }

    @Test
    void testCreateInquiryPastDateThrows() {
        InquiryRequestDto req = new InquiryRequestDto();
        req.setVenueCode("ven-101");
        req.setContactName("Vikram Singhania");
        req.setContactPhoneEmail("+91 98111 22334");
        req.setRequestedDate(LocalDate.now().minusDays(5));

        when(venueRepository.findByCode("ven-101")).thenReturn(Optional.of(sampleVenue));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                inquiryService.createInquiry(req, null));
        assertTrue(ex.getMessage().contains("cannot be in the past"));
    }

    @Test
    void testCreateInquiryRapidDuplicateThrows() {
        when(venueRepository.findByCode("ven-101")).thenReturn(Optional.of(sampleVenue));

        VenueInquiry recent = new VenueInquiry("VV-INQ-RECENT", sampleVenue, null, "Vikram",
                "+91 98111 22334", "Summit", LocalDate.now().plusDays(30), "500-1500", "Full Day",
                new BigDecimal("250000.00"), InquiryStatus.SUBMITTED, "Recent");

        when(inquiryRepository.findTopByContactPhoneEmailIgnoreCaseAndVenue_IdAndInquiryTimeAfterOrderByInquiryTimeDesc(
                eq("+91 98111 22334"), eq(501L), any(LocalDateTime.class)))
                .thenReturn(Optional.of(recent));

        InquiryRequestDto req = new InquiryRequestDto();
        req.setVenueCode("ven-101");
        req.setContactName("Vikram Singhania");
        req.setContactPhoneEmail("+91 98111 22334");
        req.setRequestedDate(LocalDate.now().plusDays(30));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                inquiryService.createInquiry(req, null));
        assertTrue(ex.getMessage().contains("Duplicate rental inquiry detected"));
    }

    @Test
    void testCalculateQuotePricingMatrix() {
        BigDecimal base = new BigDecimal("100000.00");

        // Full day, normal attendance: 1.0x -> 100,000.00
        BigDecimal fullDay = inquiryService.calculateQuote(base, "Full Day (10 Hours)", "500-1500");
        assertEquals(new BigDecimal("100000.00"), fullDay);

        // Half day, normal attendance: 0.65x -> 65,000.00
        BigDecimal halfDay = inquiryService.calculateQuote(base, "Half Day (4 Hours)", "500-1500");
        assertEquals(new BigDecimal("65000.00"), halfDay);

        // Multi day, large attendance: 2.25 * 1.25 = 2.8125x -> 281,250.00
        BigDecimal multiLarge = inquiryService.calculateQuote(base, "Multi-Day Conference", "1500+ Attendees");
        assertEquals(new BigDecimal("281250.00"), multiLarge);
    }

    @Test
    void testGetInquiryByCodeOwnerReturnsFullDetails() {
        User user = new User("Priya Patel", "priya@venuevista.in", "hash", "+91 98222 33344", Role.ROLE_ORGANIZER);
        user.setId(2L);

        VenueInquiry inq = new VenueInquiry("VV-INQ-TEST", sampleVenue, user, "Priya Patel",
                "priya@venuevista.in", "Concert", LocalDate.now().plusDays(20), "1500+", "Full Day",
                new BigDecimal("312500.00"), InquiryStatus.SUBMITTED, "VIP Stage Setup Requirements");

        when(inquiryRepository.findByInquiryCode("VV-INQ-TEST")).thenReturn(Optional.of(inq));

        InquiryResponseDto resp = inquiryService.getInquiryByCode("VV-INQ-TEST", "priya@venuevista.in", false);
        assertNotNull(resp);
        assertEquals("priya@venuevista.in", resp.getContactPhoneEmail());
        assertEquals("VIP Stage Setup Requirements", resp.getNotes());
    }

    @Test
    void testGetInquiryByCodeUnauthorizedUserThrowsAccessDenied() {
        User user = new User("Priya Patel", "priya@venuevista.in", "hash", "+91 98222 33344", Role.ROLE_ORGANIZER);
        user.setId(2L);

        VenueInquiry inq = new VenueInquiry("VV-INQ-TEST", sampleVenue, user, "Priya Patel",
                "priya@venuevista.in", "Concert", LocalDate.now().plusDays(20), "1500+", "Full Day",
                new BigDecimal("312500.00"), InquiryStatus.SUBMITTED, "VIP Stage Setup Requirements");

        when(inquiryRepository.findByInquiryCode("VV-INQ-TEST")).thenReturn(Optional.of(inq));

        assertThrows(AccessDeniedException.class, () ->
                inquiryService.getInquiryByCode("VV-INQ-TEST", "stranger@other.com", false));
    }

    @Test
    void testGetInquiryByCodeGuestMasksContact() {
        VenueInquiry guestInq = new VenueInquiry("VV-INQ-GST1", sampleVenue, null, "Guest Inquirer",
                "+91 98111 22233", "Exhibition", LocalDate.now().plusDays(15), "500-1500", "Full Day",
                new BigDecimal("250000.00"), InquiryStatus.SUBMITTED, "Confidential budget internal note");

        when(inquiryRepository.findByInquiryCode("VV-INQ-GST1")).thenReturn(Optional.of(guestInq));

        InquiryResponseDto receipt = inquiryService.getInquiryByCode("VV-INQ-GST1", null, false);
        assertNotNull(receipt);
        assertEquals("******2233", receipt.getContactPhoneEmail());
        assertNull(receipt.getNotes());
    }
}
