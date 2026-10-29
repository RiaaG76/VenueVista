package com.venuevista.repository;

import com.venuevista.entity.VenueCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VenueCategoryRepository extends JpaRepository<VenueCategory, Long> {

    Optional<VenueCategory> findBySlug(String slug);

    Optional<VenueCategory> findByKey(String key);

    List<VenueCategory> findAllByOrderByDisplayOrderAsc();
}
