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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
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
        Event event = findEventForUpdate(request.getEventId(), request.getEventCode());

        int quantity = request.getQuantity() != null ? request.getQuantity() : 1;
        if (quantity < 1 || quantity > 20) {
            throw new IllegalArgumentException("Booking quantity must be between 1 and 20 tickets");
        }

        String customerEmail = request.getCustomerEmail() != null ? request.getCustomerEmail().toLowerCase().trim() : "";
        if (customerEmail.isBlank()) {
            throw new IllegalArgumentException("Customer email is required");
        }

        // Prevent rapid repeated duplicate submissions (replay protection within 5 seconds)
        LocalDateTime recentCutoff = LocalDateTime.now().minusSeconds(5);
        Optional<TicketBooking> duplicate = bookingRepository.findTopByCustomerEmailIgnoreCaseAndEvent_IdAndBookingTimeAfterOrderByBookingTimeDesc(
                customerEmail, event.getId(), recentCutoff);
        if (duplicate.isPresent()) {
            throw new IllegalStateException("Duplicate booking detected. A booking for this event was just processed. Please check your bookings before submitting again.");
        }

        // Enforce inventory constraints under pessimistic lock and thread safety
        synchronized (event) {
            if (event.getAvailableSeats() == null || event.getAvailableSeats() < quantity) {
                throw new IllegalStateException("Insufficient seats available for event: " + event.getTitle() +
                        ". Requested: " + quantity + ", Available: " + (event.getAvailableSeats() == null ? 0 : event.getAvailableSeats()));
            }

            // Transactionally deduct seats
            event.setAvailableSeats(event.getAvailableSeats() - quantity);
            eventRepository.save(event);
        }

        User user = null;
        if (currentUserEmail != null && !currentUserEmail.isBlank()) {
            user = userRepository.findByEmail(currentUserEmail).orElse(null);
        } else {
            user = userRepository.findByEmail(customerEmail).orElse(null);
        }

        // Calculate prices strictly on backend
        BigDecimal unitPrice = event.getStartingPrice() != null ? event.getStartingPrice() : BigDecimal.ZERO;
        BigDecimal totalAmount = unitPrice.multiply(BigDecimal.valueOf(quantity));

        String bookingCode = generateUniqueBookingCode();

        TicketBooking booking = new TicketBooking(
                bookingCode,
                event,
                user,
                request.getCustomerName().trim(),
                customerEmail,
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
        return getBookingByCode(code, null, false);
    }

    @Transactional(readOnly = true)
    public BookingResponseDto getBookingByCode(String code, String currentUserEmail, boolean isAdmin) {
        TicketBooking booking = bookingRepository.findByBookingCode(code.trim().toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Booking not found with code: " + code));

        boolean isOwner = false;
        if (currentUserEmail != null && !currentUserEmail.isBlank()) {
            if (booking.getUser() != null && currentUserEmail.equalsIgnoreCase(booking.getUser().getEmail())) {
                isOwner = true;
            } else if (currentUserEmail.equalsIgnoreCase(booking.getCustomerEmail())) {
                isOwner = true;
            }
        }

        // IDOR protection: Registered user bookings cannot be inspected by unauthorized parties
        if (booking.getUser() != null && !isOwner && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to view this private booking");
        }

        BookingResponseDto dto = new BookingResponseDto(booking);
        // Guest receipt protection: Sanitize sensitive personal details if not authenticated owner or admin
        if (!isOwner && !isAdmin) {
            dto.maskSensitiveDetails();
        }
        return dto;
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDto> getUserBookings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found with email: " + email));

        return bookingRepository.findByUserIdOrderByBookingTimeDesc(user.getId()).stream()
                .map(BookingResponseDto::new)
                .toList();
    }

    private Event findEventForUpdate(Long id, String code) {
        if (id != null) {
            Optional<Event> locked = eventRepository.findByIdForUpdate(id);
            if (locked != null && locked.isPresent()) {
                return locked.get();
            }
            return eventRepository.findById(id)
                    .orElseThrow(() -> new NoSuchElementException("Event not found with ID: " + id));
        }
        if (code != null && !code.isBlank()) {
            Optional<Event> locked = eventRepository.findByCodeForUpdate(code.trim());
            if (locked != null && locked.isPresent()) {
                return locked.get();
            }
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
