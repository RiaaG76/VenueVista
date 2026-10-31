package com.venuevista.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class SecurityConfigTest {

    @Mock
    private JwtAuthenticationEntryPoint authenticationEntryPoint;

    @Mock
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private SecurityConfig securityConfig;

    @BeforeEach
    void setUp() {
        securityConfig = new SecurityConfig(authenticationEntryPoint, jwtAuthenticationFilter);
        ReflectionTestUtils.setField(securityConfig, "configuredAllowedOrigins", "https://venuevista-frontend-9tz7.onrender.com");
    }

    @Test
    void testCorsConfigurationAllowedOrigins() {
        CorsConfigurationSource source = securityConfig.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/events");

        CorsConfiguration config = source.getCorsConfiguration(request);
        assertNotNull(config);

        // Deployed Render frontend origin must be allowed
        String productionOrigin = "https://venuevista-frontend-9tz7.onrender.com";
        assertEquals(productionOrigin, config.checkOrigin(productionOrigin));

        // Localhost development origins must be allowed
        assertEquals("http://localhost:3000", config.checkOrigin("http://localhost:3000"));
        assertEquals("http://localhost:8081", config.checkOrigin("http://localhost:8081"));
        assertEquals("http://127.0.0.1:5500", config.checkOrigin("http://127.0.0.1:5500"));
        assertEquals("http://[::1]:8080", config.checkOrigin("http://[::1]:8080"));

        // Arbitrary unauthorized origins must be rejected
        assertNull(config.checkOrigin("https://evil-site.com"));
        assertNull(config.checkOrigin("http://otherdomain.org"));

        // Wildcard origin "*" must not be present
        List<String> allowedOrigins = config.getAllowedOrigins();
        assertTrue(allowedOrigins == null || !allowedOrigins.contains("*"));
    }

    @Test
    void testCorsConfigurationMethodsAndHeaders() {
        CorsConfigurationSource source = securityConfig.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/bookings");

        CorsConfiguration config = source.getCorsConfiguration(request);
        assertNotNull(config);

        // Required HTTP methods
        List<String> methods = config.getAllowedMethods();
        assertNotNull(methods);
        assertTrue(methods.contains("GET"));
        assertTrue(methods.contains("POST"));
        assertTrue(methods.contains("PUT"));
        assertTrue(methods.contains("PATCH"));
        assertTrue(methods.contains("DELETE"));
        assertTrue(methods.contains("OPTIONS"));

        // Required Headers
        List<String> headers = config.getAllowedHeaders();
        assertNotNull(headers);
        assertTrue(headers.contains("Authorization"));
        assertTrue(headers.contains("Content-Type"));
        assertTrue(headers.contains("Accept"));

        // Exposed headers for JWT tokens
        List<String> exposed = config.getExposedHeaders();
        assertNotNull(exposed);
        assertTrue(exposed.contains("Authorization"));

        // Credentials
        assertEquals(Boolean.TRUE, config.getAllowCredentials());
    }
}
