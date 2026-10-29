package com.venuevista.repository;

import com.venuevista.entity.VenueInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VenueInquiryRepository extends JpaRepository<VenueInquiry, Long> {

    Optional<VenueInquiry> findByInquiryCode(String inquiryCode);

    List<VenueInquiry> findByContactPhoneEmailContainingIgnoreCaseOrderByInquiryTimeDesc(String contact);

    List<VenueInquiry> findByUserIdOrderByInquiryTimeDesc(Long userId);

    List<VenueInquiry> findByVenue_Id(Long venueId);
}
