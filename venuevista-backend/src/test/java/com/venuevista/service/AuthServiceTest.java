package com.venuevista.service;

import com.venuevista.dto.AuthResponse;
import com.venuevista.dto.LoginRequest;
import com.venuevista.dto.RegisterRequest;
import com.venuevista.dto.UserDto;
import com.venuevista.entity.Role;
import com.venuevista.entity.User;
import com.venuevista.repository.UserRepository;
import com.venuevista.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, tokenProvider);
    }

    @Test
    void testRegisterSuccess() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test User");
        req.setEmail("test@venuevista.in");
        req.setPassword("Password@123");
        req.setPhone("+91 99999 88888");

        when(userRepository.existsByEmail("test@venuevista.in")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("encodedPassword");

        User savedUser = new User("Test User", "test@venuevista.in", "encodedPassword", "+91 99999 88888", Role.ROLE_USER);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserDto dto = authService.register(req);
        assertNotNull(dto);
        assertEquals("Test User", dto.getName());
        assertEquals("test@venuevista.in", dto.getEmail());
    }

    @Test
    void testRegisterDuplicateEmail() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test User");
        req.setEmail("test@venuevista.in");
        req.setPassword("Password@123");

        when(userRepository.existsByEmail("test@venuevista.in")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.register(req));
    }

    @Test
    void testLoginSuccess() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@venuevista.in");
        req.setPassword("Password@123");

        User user = new User("Test User", "test@venuevista.in", "encodedPassword", "+91 99999 88888", Role.ROLE_USER);
        when(userRepository.findByEmail("test@venuevista.in")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password@123", "encodedPassword")).thenReturn(true);
        when(tokenProvider.generateToken("test@venuevista.in", Role.ROLE_USER)).thenReturn("mock-jwt-token");

        AuthResponse resp = authService.login(req);
        assertNotNull(resp);
        assertEquals("mock-jwt-token", resp.getToken());
        assertEquals("test@venuevista.in", resp.getUser().getEmail());
    }

    @Test
    void testLoginInvalidPassword() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@venuevista.in");
        req.setPassword("WrongPassword");

        User user = new User("Test User", "test@venuevista.in", "encodedPassword", "+91 99999 88888", Role.ROLE_USER);
        when(userRepository.findByEmail("test@venuevista.in")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "encodedPassword")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login(req));
    }
}
