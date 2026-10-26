package com.venuevista;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Context load verification test.
 * Disabled until local MySQL database instance is running and reachable.
 */
@SpringBootTest
class VenueVistaApplicationTests {

    @Test
    @Disabled("Requires a running MySQL database instance. Enable once local MySQL is configured.")
    void contextLoads() {
    }
}
