package com.venuevista.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.venuevista.dto.InquiryRequestDto;
import com.venuevista.dto.InquiryResponseDto;
import com.venuevista.service.InquiryService;
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

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class InquiryControllerTest {

    private MockMvc mockMvc;

    @Mock
    private InquiryService inquiryService;

    @InjectMocks
    private InquiryController inquiryController;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(inquiryController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void testSubmitInquirySuccess() throws Exception {
        InquiryResponseDto resp = new InquiryResponseDto();
        resp.setInquiryCode("VV-INQ-2026-TEST");

        when(inquiryService.createInquiry(any(InquiryRequestDto.class), any())).thenReturn(resp);

        InquiryRequestDto req = new InquiryRequestDto();
        req.setVenueCode("ven-101");
        req.setContactName("Priya Patel");
        req.setContactPhoneEmail("+91 98222 33344");
        req.setEventType("Concert");
        req.setRequestedDate(LocalDate.now().plusDays(20));
        req.setRentalDuration("Full Day (10 Hours)");
        req.setExpectedAttendance("500-1500");

        mockMvc.perform(post("/api/venues/inquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.inquiryCode").value("VV-INQ-2026-TEST"));
    }

    @Test
    void testSubmitInquiryPastDateRejected() throws Exception {
        InquiryRequestDto req = new InquiryRequestDto();
        req.setVenueCode("ven-101");
        req.setContactName("Priya Patel");
        req.setContactPhoneEmail("+91 98222 33344");
        req.setEventType("Concert");
        req.setRequestedDate(LocalDate.now().minusDays(1)); // Past date
        req.setRentalDuration("Full Day (10 Hours)");
        req.setExpectedAttendance("500-1500");

        mockMvc.perform(post("/api/venues/inquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.requestedDate").exists());
    }

    @Test
    void testGetInquiryUnauthorizedReturnsForbidden() throws Exception {
        when(inquiryService.getInquiryByCode(eq("VV-INQ-PRIV"), any(), anyBoolean()))
                .thenThrow(new AccessDeniedException("Access denied"));

        mockMvc.perform(get("/api/venues/inquiries/VV-INQ-PRIV"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }
}
