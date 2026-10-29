package com.venuevista;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Context load verification test.
 * Connects to the local MySQL instance to verify Spring context and entity mappings.
 * Injects a test-only JWT secret with sufficient entropy for test execution.
 */
@SpringBootTest(properties = {
        "venuevista.jwt.secret=TestJwtSecretKeyForUnitTestingOnlyWithSufficientEntropy1234567890!"
})
class VenueVistaApplicationTests {

    @Test
    void contextLoads() {
    }
}
