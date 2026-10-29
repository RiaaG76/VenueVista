package com.venuevista.controller;

import com.venuevista.dto.ApiResponse;
import com.venuevista.dto.InquiryRequestDto;
import com.venuevista.dto.InquiryResponseDto;
import com.venuevista.service.InquiryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues/inquiries")
public class InquiryController {

    private final InquiryService inquiryService;

    public InquiryController(InquiryService inquiryService) {
        this.inquiryService = inquiryService;
    }

    /**
     * Submit a venue rental inquiry (Public / Organizer or Authenticated).
     */
    @PostMapping
    public ResponseEntity<ApiResponse<InquiryResponseDto>> submitInquiry(
            @Valid @RequestBody InquiryRequestDto request,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        InquiryResponseDto response = inquiryService.createInquiry(request, email);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Rental inquiry submitted successfully with estimated quote", response));
    }

    /**
     * Lookup an inquiry by unique inquiry code (e.g. VV-INQ-2026-K4L2).
     */
    @GetMapping("/{inquiryCode}")
    public ResponseEntity<ApiResponse<InquiryResponseDto>> getInquiryByCode(
            @PathVariable String inquiryCode) {
        InquiryResponseDto response = inquiryService.getInquiryByCode(inquiryCode);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * Get all inquiries for the currently authenticated user.
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<InquiryResponseDto>>> getMyInquiries(
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to view personal inquiries"));
        }
        List<InquiryResponseDto> list = inquiryService.getUserInquiries(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
