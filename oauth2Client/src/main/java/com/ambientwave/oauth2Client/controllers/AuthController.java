package com.ambientwave.oauth2Client.controllers;

import com.ambientwave.oauth2Client.dto.AuthRequest;
import com.ambientwave.oauth2Client.dto.AuthResponse;
import com.ambientwave.oauth2Client.dto.RegisterRequest;
import com.ambientwave.oauth2Client.models.User;
import com.ambientwave.oauth2Client.repository.UserRepository;
import com.ambientwave.oauth2Client.security.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil,
            UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, "Error: Email is already taken!"));
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProvider("local");

        userRepository.save(user);

        return ResponseEntity.ok(new AuthResponse(null, "User registered successfully!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request, HttpServletResponse response) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String jwt = jwtUtil.generateToken(request.getEmail());

        Cookie cookie = new Cookie("jwt", jwt);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Make true in prod
        cookie.setPath("/");
        cookie.setMaxAge(86400);
        response.addCookie(cookie);

        return ResponseEntity.ok(new AuthResponse(jwt, "Login successful"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", null);
        cookie.setHttpOnly(true); // HttpOnly cookies are cookies that cannot be accessed or modified by
                                  // client-side JavaScript, enhancing security by preventing attacks like
                                  // cross-site scripting (XSS). This means only the server can read or manipulate
                                  // these cookies, making them safer for storing sensitive information.
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok(new AuthResponse(null, "Logged out successfully"));
    }
}
