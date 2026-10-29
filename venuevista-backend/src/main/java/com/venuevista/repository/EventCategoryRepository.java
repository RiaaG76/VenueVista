package com.venuevista.repository;

import com.venuevista.entity.EventCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventCategoryRepository extends JpaRepository<EventCategory, Long> {

    Optional<EventCategory> findBySlug(String slug);

    Optional<EventCategory> findByKey(String key);

    List<EventCategory> findAllByOrderByDisplayOrderAsc();
}
