package com.venuevista.service;

import com.venuevista.dto.InquiryRequestDto;
import com.venuevista.dto.InquiryResponseDto;
import com.venuevista.entity.InquiryStatus;
import com.venuevista.entity.User;
import com.venuevista.entity.Venue;
import com.venuevista.entity.VenueInquiry;
import com.venuevista.repository.UserRepository;
import com.venuevista.repository.VenueInquiryRepository;
import com.venuevista.repository.VenueRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class InquiryService {

    private final VenueInquiryRepository inquiryRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final SecureRandom random = new SecureRandom();

    public InquiryService(VenueInquiryRepository inquiryRepository,
                          VenueRepository venueRepository,
                          UserRepository userRepository) {
        this.inquiryRepository = inquiryRepository;
        this.venueRepository = venueRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public InquiryResponseDto createInquiry(InquiryRequestDto request, String currentUserEmail) {
        Venue venue = findVenue(request.getVenueId(), request.getVenueCode());

        // Validate date is not in the past
        if (request.getRequestedDate() != null && request.getRequestedDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Requested rental date cannot be in the past");
        }

        String contact = request.getContactPhoneEmail() != null ? request.getContactPhoneEmail().trim() : "";
        if (contact.isBlank()) {
            throw new IllegalArgumentException("Contact phone or email is required");
        }

        // Replay / rapid duplicate inquiry protection (within 5 seconds)
        LocalDateTime cutoff = LocalDateTime.now().minusSeconds(5);
        Optional<VenueInquiry> duplicate = inquiryRepository.findTopByContactPhoneEmailIgnoreCaseAndVenue_IdAndInquiryTimeAfterOrderByInquiryTimeDesc(
                contact, venue.getId(), cutoff);
        if (duplicate.isPresent()) {
            throw new IllegalStateException("Duplicate rental inquiry detected. An inquiry for this venue was just submitted.");
        }

        User user = null;
        if (currentUserEmail != null && !currentUserEmail.isBlank()) {
            user = userRepository.findByEmail(currentUserEmail).orElse(null);
        }

        BigDecimal quote = calculateQuote(venue.getBaseRental(), request.getRentalDuration(), request.getExpectedAttendance());
        String code = generateUniqueInquiryCode();

        VenueInquiry inquiry = new VenueInquiry(
                code,
                venue,
                user,
                request.getContactName().trim(),
                contact,
                request.getEventType(),
                request.getRequestedDate(),
                request.getExpectedAttendance(),
                request.getRentalDuration(),
                quote,
                InquiryStatus.SUBMITTED,
                request.getNotes() != null ? request.getNotes() : "Submitted via VenueVista College Demo"
        );

        VenueInquiry saved = inquiryRepository.save(inquiry);
        return new InquiryResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public InquiryResponseDto getInquiryByCode(String code) {
        return getInquiryByCode(code, null, false);
    }

    @Transactional(readOnly = true)
    public InquiryResponseDto getInquiryByCode(String code, String currentUserEmail, boolean isAdmin) {
        VenueInquiry inquiry = inquiryRepository.findByInquiryCode(code.trim().toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Inquiry not found with code: " + code));

        boolean isOwner = false;
        if (currentUserEmail != null && !currentUserEmail.isBlank()) {
            if (inquiry.getUser() != null && currentUserEmail.equalsIgnoreCase(inquiry.getUser().getEmail())) {
                isOwner = true;
            } else if (currentUserEmail.equalsIgnoreCase(inquiry.getContactPhoneEmail())) {
                isOwner = true;
            }
        }

        // IDOR protection: Registered user inquiries cannot be inspected by unauthorized parties
        if (inquiry.getUser() != null && !isOwner && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to view this private inquiry");
        }

        InquiryResponseDto dto = new InquiryResponseDto(inquiry);
        if (!isOwner && !isAdmin) {
            dto.maskSensitiveDetails();
        }
        return dto;
    }

    @Transactional(readOnly = true)
    public List<InquiryResponseDto> getUserInquiries(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found with email: " + email));

        return inquiryRepository.findByUserIdOrderByInquiryTimeDesc(user.getId()).stream()
                .map(InquiryResponseDto::new)
                .toList();
    }

    private Venue findVenue(Long id, String code) {
        if (id != null) {
            return venueRepository.findById(id)
                    .orElseThrow(() -> new NoSuchElementException("Venue not found with ID: " + id));
        }
        if (code != null && !code.isBlank()) {
            return venueRepository.findByCode(code.trim())
                    .orElseThrow(() -> new NoSuchElementException("Venue not found with code: " + code));
        }
        throw new IllegalArgumentException("Either venueId or venueCode must be provided");
    }

    public BigDecimal calculateQuote(BigDecimal baseRental, String duration, String attendance) {
        if (baseRental == null) {
            return BigDecimal.ZERO;
        }

        double durationMultiplier = 1.0;
        if (duration != null) {
            String lower = duration.toLowerCase();
            if (lower.contains("half")) {
                durationMultiplier = 0.65;
            } else if (lower.contains("multi")) {
                durationMultiplier = 2.25;
            }
        }

        double attendanceSurcharge = 1.0;
        if (attendance != null && attendance.contains("1500+")) {
            attendanceSurcharge = 1.25;
        }

        return baseRental.multiply(BigDecimal.valueOf(durationMultiplier * attendanceSurcharge))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private String generateUniqueInquiryCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder("VV-INQ-2026-");
            for (int i = 0; i < 4; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            String code = sb.toString();
            if (inquiryRepository.findByInquiryCode(code).isEmpty()) {
                return code;
            }
        }
        return "VV-INQ-" + System.currentTimeMillis();
    }
}
