package com.venuevista.repository;

import com.venuevista.entity.Event;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    Optional<Event> findByCode(String code);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Event e WHERE e.id = :id")
    Optional<Event> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Event e WHERE e.code = :code")
    Optional<Event> findByCodeForUpdate(@Param("code") String code);

    List<Event> findByCategory_Slug(String slug);

    List<Event> findByCategory_KeyIgnoreCase(String key);

    List<Event> findByCityIgnoreCase(String city);

    @Query("SELECT e FROM Event e WHERE " +
           "(:category IS NULL OR :category = '' OR LOWER(e.category.key) = LOWER(:category) OR LOWER(e.category.slug) = LOWER(:category)) AND " +
           "(:city IS NULL OR :city = '' OR LOWER(e.city) = LOWER(:city)) AND " +
           "(:query IS NULL OR :query = '' OR LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(e.venue) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY e.id ASC")
    List<Event> searchEvents(@Param("category") String category,
                             @Param("city") String city,
                             @Param("query") String query);

    long countByCategory_Slug(String slug);
}
