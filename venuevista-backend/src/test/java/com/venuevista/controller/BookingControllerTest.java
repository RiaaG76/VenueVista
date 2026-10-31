package com.venuevista.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.venuevista.dto.BookingRequestDto;
import com.venuevista.dto.BookingResponseDto;
import com.venuevista.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    private MockMvc mockMvc;

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingController bookingController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(bookingController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void testCreateBookingSuccess() throws Exception {
        BookingResponseDto resp = new BookingResponseDto();
        resp.setBookingCode("VV-BK-2026-TEST");
        resp.setQuantity(2);
        resp.setAvailableSeats(448);

        when(bookingService.createBooking(any(BookingRequestDto.class), any())).thenReturn(resp);

        BookingRequestDto req = new BookingRequestDto();
        req.setEventCode("evt-music-1");
        req.setCustomerName("Aarav Sharma");
        req.setCustomerEmail("aarav@venuevista.in");
        req.setQuantity(2);

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.bookingCode").value("VV-BK-2026-TEST"))
                .andExpect(jsonPath("$.data.availableSeats").value(448));
    }

    @Test
    void testCreateBookingValidationFailureExceedsMaxTickets() throws Exception {
        BookingRequestDto req = new BookingRequestDto();
        req.setEventCode("evt-music-1");
        req.setCustomerName("Aarav Sharma");
        req.setCustomerEmail("aarav@venuevista.in");
        req.setQuantity(25); // Exceeds max 20

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.quantity").exists());
    }

    @Test
    void testCreateBookingInsufficientSeatsReturnsBadRequest() throws Exception {
        when(bookingService.createBooking(any(BookingRequestDto.class), any()))
                .thenThrow(new IllegalStateException("Insufficient seats available"));

        BookingRequestDto req = new BookingRequestDto();
        req.setEventCode("evt-music-1");
        req.setCustomerName("Aarav Sharma");
        req.setCustomerEmail("aarav@venuevista.in");
        req.setQuantity(2);

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Insufficient seats available"));
    }

    @Test
    void testGetBookingByCodeUnauthorizedReturnsForbidden() throws Exception {
        when(bookingService.getBookingByCode(eq("VV-BK-2026-PRIV"), any(), anyBoolean()))
                .thenThrow(new AccessDeniedException("Access denied"));

        mockMvc.perform(get("/api/bookings/VV-BK-2026-PRIV"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }
}
