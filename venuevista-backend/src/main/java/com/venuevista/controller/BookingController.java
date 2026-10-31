package com.venuevista.controller;

import com.venuevista.dto.ApiResponse;
import com.venuevista.dto.BookingRequestDto;
import com.venuevista.dto.BookingResponseDto;
import com.venuevista.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Reserve an event ticket pass (Public / Guest or Authenticated).
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponseDto>> createBooking(
            @Valid @RequestBody BookingRequestDto request,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        BookingResponseDto response = bookingService.createBooking(request, email);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Ticket pass reserved successfully", response));
    }

    /**
     * Lookup a booking by unique booking code (e.g. VV-BK-2026-X8F9).
     * Protected against IDOR: personal details are masked for guest views and restricted for private bookings.
     */
    @GetMapping("/{bookingCode}")
    public ResponseEntity<ApiResponse<BookingResponseDto>> getBookingByCode(
            @PathVariable String bookingCode,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        BookingResponseDto response = bookingService.getBookingByCode(bookingCode, email, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * Get all bookings for the currently authenticated user.
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingResponseDto>>> getMyBookings(
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to view personal bookings"));
        }
        List<BookingResponseDto> list = bookingService.getUserBookings(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
