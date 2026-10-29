package com.venuevista.repository;

import com.venuevista.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {

    Optional<Venue> findByCode(String code);

    List<Venue> findByCategory_Slug(String slug);

    List<Venue> findByCategory_KeyIgnoreCase(String key);

    List<Venue> findByCityIgnoreCase(String city);

    @Query("SELECT DISTINCT v.city FROM Venue v ORDER BY v.city ASC")
    List<String> findDistinctCities();

    @Query("SELECT v FROM Venue v WHERE " +
           "(:category IS NULL OR :category = '' OR LOWER(v.category.key) = LOWER(:category) OR LOWER(v.category.slug) = LOWER(:category)) AND " +
           "(:city IS NULL OR :city = '' OR LOWER(v.city) = LOWER(:city)) AND " +
           "(:query IS NULL OR :query = '' OR LOWER(v.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(v.location) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(v.suitableFor) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY v.id ASC")
    List<Venue> searchVenues(@Param("category") String category,
                             @Param("city") String city,
                             @Param("query") String query);

    long countByCategory_Slug(String slug);
}
