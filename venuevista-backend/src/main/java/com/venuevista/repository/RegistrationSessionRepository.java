package com.venuevista.repository;

import com.venuevista.entity.RegistrationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RegistrationSessionRepository extends JpaRepository<RegistrationSession, Long> {

    Optional<RegistrationSession> findBySessionId(String sessionId);

    Optional<RegistrationSession> findByEmail(String email);

    Optional<RegistrationSession> findByPhone(String phone);

    void deleteBySessionId(String sessionId);

    void deleteByEmail(String email);

    void deleteByPhone(String phone);
}
