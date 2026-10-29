package com.venuevista.service;

import com.venuevista.dto.BookingRequestDto;
import com.venuevista.dto.BookingResponseDto;
import com.venuevista.entity.BookingStatus;
import com.venuevista.entity.Event;
import com.venuevista.entity.TicketBooking;
import com.venuevista.entity.User;
import com.venuevista.repository.EventRepository;
import com.venuevista.repository.TicketBookingRepository;
import com.venuevista.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class BookingService {

    private final TicketBookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final SecureRandom random = new SecureRandom();

    public BookingService(TicketBookingRepository bookingRepository,
                          EventRepository eventRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BookingResponseDto createBooking(BookingRequestDto request, String currentUserEmail) {
        Event event = findEvent(request.getEventId(), request.getEventCode());

        User user = null;
        if (currentUserEmail != null && !currentUserEmail.isBlank()) {
            user = userRepository.findByEmail(currentUserEmail).orElse(null);
        } else if (request.getCustomerEmail() != null) {
            user = userRepository.findByEmail(request.getCustomerEmail().toLowerCase().trim()).orElse(null);
        }

        int quantity = request.getQuantity() != null && request.getQuantity() > 0 ? request.getQuantity() : 1;
        BigDecimal unitPrice = event.getStartingPrice();
        BigDecimal totalAmount = unitPrice.multiply(BigDecimal.valueOf(quantity));

        // Deduct seats if available
        if (event.getAvailableSeats() != null && event.getAvailableSeats() >= quantity) {
            event.setAvailableSeats(event.getAvailableSeats() - quantity);
            eventRepository.save(event);
        }

        String bookingCode = generateUniqueBookingCode();

        TicketBooking booking = new TicketBooking(
                bookingCode,
                event,
                user,
                request.getCustomerName().trim(),
                request.getCustomerEmail().toLowerCase().trim(),
                request.getCustomerPhone(),
                request.getTicketTier() != null ? request.getTicketTier() : "General Admission",
                quantity,
                unitPrice,
                totalAmount,
                BookingStatus.CONFIRMED,
                request.getNotes() != null ? request.getNotes() : "College Demo MVP Pass"
        );

        TicketBooking saved = bookingRepository.save(booking);
        return new BookingResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public BookingResponseDto getBookingByCode(String code) {
        TicketBooking booking = bookingRepository.findByBookingCode(code.trim().toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Booking not found with code: " + code));
        return new BookingResponseDto(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDto> getUserBookings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found with email: " + email));

        return bookingRepository.findByUserIdOrderByBookingTimeDesc(user.getId()).stream()
                .map(BookingResponseDto::new)
                .toList();
    }

    private Event findEvent(Long id, String code) {
        if (id != null) {
            return eventRepository.findById(id)
                    .orElseThrow(() -> new NoSuchElementException("Event not found with ID: " + id));
        }
        if (code != null && !code.isBlank()) {
            return eventRepository.findByCode(code.trim())
                    .orElseThrow(() -> new NoSuchElementException("Event not found with code: " + code));
        }
        throw new IllegalArgumentException("Either eventId or eventCode must be provided");
    }

    private String generateUniqueBookingCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder("VV-BK-2026-");
            for (int i = 0; i < 4; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            String code = sb.toString();
            if (bookingRepository.findByBookingCode(code).isEmpty()) {
                return code;
            }
        }
        return "VV-BK-" + System.currentTimeMillis();
    }
}
