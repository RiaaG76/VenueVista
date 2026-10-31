package com.venuevista.service;

import com.venuevista.dto.AuthResponse;
import com.venuevista.dto.LoginRequest;
import com.venuevista.dto.RegisterRequest;
import com.venuevista.dto.UserDto;
import com.venuevista.entity.Role;
import com.venuevista.entity.User;
import com.venuevista.repository.UserRepository;
import com.venuevista.security.JwtTokenProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public UserDto register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email is already registered: " + normalizedEmail);
        }

        String phone = request.getPhone() != null && !request.getPhone().isBlank() ? request.getPhone().trim() : null;
        if (phone != null && userRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("Phone number is already registered: " + phone);
        }

        User user = new User(
                request.getName(),
                normalizedEmail,
                passwordEncoder.encode(request.getPassword()),
                phone,
                Role.ROLE_USER
        );
        user.setEmailVerified(Boolean.TRUE);
        user.setPhoneVerified(Boolean.TRUE);

        User saved = userRepository.save(user);
        return new UserDto(saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, new UserDto(user));
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return new UserDto(user);
    }
}
