package com.venuevista.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.venuevista.entity.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Standard RFC 7519 HMAC-SHA256 JWT provider using native Java cryptography and Jackson.
 * Self-contained without requiring third-party library downloads.
 */
@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final byte[] secretKeyBytes;
    private final long expirationMs;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JwtTokenProvider(
            @Value("${venuevista.jwt.secret:}") String secret,
            @Value("${venuevista.jwt.expiration-ms:86400000}") long expirationMs) {
        validateSecret(secret);
        this.secretKeyBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationMs = expirationMs;
    }

    /**
     * Validates that the JWT secret is present and meets HMAC-SHA256 cryptographic strength standards.
     * RFC 7518 Section 3.2 requires a minimum key length equal to or greater than the hash output size (256 bits / 32 bytes).
     */
    private void validateSecret(String secret) {
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException(
                "JWT signing secret is missing. Configure the 'VENUEVISTA_JWT_SECRET' environment variable " +
                "or 'venuevista.jwt.secret' property before starting the application."
            );
        }
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                "Configured JWT secret has insufficient cryptographic strength for HMAC-SHA256. " +
                "A minimum of 256 bits (32 bytes) is required by RFC 7518, but current length is " +
                keyBytes.length + " bytes."
            );
        }
    }

    /**
     * Generate signed JWT token.
     */
    public String generateToken(String email, Role role) {
        try {
            long now = System.currentTimeMillis();
            long exp = now + expirationMs;

            // Header
            Map<String, Object> header = new HashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");
            String encodedHeader = base64UrlEncode(objectMapper.writeValueAsBytes(header));

            // Payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("sub", email);
            payload.put("role", role != null ? role.name() : Role.ROLE_USER.name());
            payload.put("iat", now / 1000);
            payload.put("exp", exp / 1000);
            payload.put("iss", "venuevista-backend");
            String encodedPayload = base64UrlEncode(objectMapper.writeValueAsBytes(payload));

            // Signature
            String signingInput = encodedHeader + "." + encodedPayload;
            String signature = sign(signingInput);

            return signingInput + "." + signature;
        } catch (Exception e) {
            log.error("Could not generate JWT token", e);
            throw new RuntimeException("Error generating auth token", e);
        }
    }

    /**
     * Validate JWT token structure, signature, and expiration.
     */
    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return false;
        }

        try {
            String signingInput = parts[0] + "." + parts[1];
            String expectedSignature = sign(signingInput);

            // Constant time comparison to prevent timing attacks
            if (!MessageDigest.isEqual(parts[2].getBytes(StandardCharsets.UTF_8), expectedSignature.getBytes(StandardCharsets.UTF_8))) {
                return false;
            }

            // Check expiration
            byte[] payloadBytes = base64UrlDecode(parts[1]);
            JsonNode payloadNode = objectMapper.readTree(payloadBytes);
            if (payloadNode.has("exp")) {
                long expSeconds = payloadNode.get("exp").asLong();
                long nowSeconds = System.currentTimeMillis() / 1000;
                if (nowSeconds >= expSeconds) {
                    return false;
                }
            }
            return true;
        } catch (Exception e) {
            log.debug("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Extract email (subject) from JWT token.
     */
    public String getEmailFromToken(String token) {
        try {
            String[] parts = token.split("\\.");
            byte[] payloadBytes = base64UrlDecode(parts[1]);
            JsonNode node = objectMapper.readTree(payloadBytes);
            return node.has("sub") ? node.get("sub").asText() : null;
        } catch (Exception e) {
            log.error("Could not extract email from token", e);
            return null;
        }
    }

    /**
     * Extract role from JWT token.
     */
    public String getRoleFromToken(String token) {
        try {
            String[] parts = token.split("\\.");
            byte[] payloadBytes = base64UrlDecode(parts[1]);
            JsonNode node = objectMapper.readTree(payloadBytes);
            return node.has("role") ? node.get("role").asText() : Role.ROLE_USER.name();
        } catch (Exception e) {
            return Role.ROLE_USER.name();
        }
    }

    private String sign(String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKeyBytes, "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return base64UrlEncode(rawHmac);
    }

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private byte[] base64UrlDecode(String str) {
        return Base64.getUrlDecoder().decode(str);
    }
}
