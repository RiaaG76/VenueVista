package com.venuevista.repository;

import com.venuevista.entity.TicketBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketBookingRepository extends JpaRepository<TicketBooking, Long> {

    Optional<TicketBooking> findByBookingCode(String bookingCode);

    List<TicketBooking> findByCustomerEmailIgnoreCaseOrderByBookingTimeDesc(String customerEmail);

    List<TicketBooking> findByUserIdOrderByBookingTimeDesc(Long userId);

    List<TicketBooking> findByEvent_Id(Long eventId);
}
