package com.venuevista.security;

import com.venuevista.entity.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    // Test-only secret with sufficient entropy (>= 256 bits / 32 bytes)
    private static final String TEST_SECRET = "TestSecretKeyForUnitTestingPurposesOnlyWithSufficientLength123!";
    private static final String DIFFERENT_SECRET = "AnotherDifferentSecretKeyForUnitTestingOnly1234567890!";

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(TEST_SECRET, 86400000L);
    }

    @Test
    void testGenerateTokenAndValidate() {
        String token = jwtTokenProvider.generateToken("test@venuevista.in", Role.ROLE_USER);
        assertNotNull(token);
        assertEquals(3, token.split("\\.").length);

        boolean isValid = jwtTokenProvider.validateToken(token);
        assertTrue(isValid);

        String email = jwtTokenProvider.getEmailFromToken(token);
        assertEquals("test@venuevista.in", email);

        String role = jwtTokenProvider.getRoleFromToken(token);
        assertEquals("ROLE_USER", role);
    }

    @Test
    void testMissingSecretThrowsException() {
        // Null secret
        IllegalStateException exNull = assertThrows(IllegalStateException.class, () ->
                new JwtTokenProvider(null, 86400000L));
        assertTrue(exNull.getMessage().contains("JWT signing secret is missing"));

        // Empty secret
        IllegalStateException exEmpty = assertThrows(IllegalStateException.class, () ->
                new JwtTokenProvider("", 86400000L));
        assertTrue(exEmpty.getMessage().contains("JWT signing secret is missing"));

        // Blank whitespace-only secret
        IllegalStateException exBlank = assertThrows(IllegalStateException.class, () ->
                new JwtTokenProvider("    ", 86400000L));
        assertTrue(exBlank.getMessage().contains("JWT signing secret is missing"));
    }

    @Test
    void testWeakSecretThrowsException() {
        // Less than 32 bytes (256 bits)
        IllegalStateException exShort = assertThrows(IllegalStateException.class, () ->
                new JwtTokenProvider("short-secret-under-32-chars", 86400000L));
        assertTrue(exShort.getMessage().contains("insufficient cryptographic strength"));
    }

    @Test
    void testTokenSignatureTamperingFails() {
        String token = jwtTokenProvider.generateToken("test@venuevista.in", Role.ROLE_USER);
        JwtTokenProvider otherProvider = new JwtTokenProvider(DIFFERENT_SECRET, 86400000L);

        // Validation with a different secret must fail
        assertFalse(otherProvider.validateToken(token));
    }

    @Test
    void testExpiredToken() {
        // Provider configured with negative expiration
        JwtTokenProvider expiredProvider = new JwtTokenProvider(TEST_SECRET, -5000L);
        String token = expiredProvider.generateToken("test@venuevista.in", Role.ROLE_USER);

        assertFalse(expiredProvider.validateToken(token));
    }

    @Test
    void testInvalidToken() {
        assertFalse(jwtTokenProvider.validateToken("invalid.token.structure"));
        assertFalse(jwtTokenProvider.validateToken(null));
        assertFalse(jwtTokenProvider.validateToken(""));
        assertFalse(jwtTokenProvider.validateToken("header.payload"));
    }
}
