package com.ambientwave.oauth2Client.security;

import com.ambientwave.oauth2Client.models.User;
import com.ambientwave.oauth2Client.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public OAuth2AuthenticationSuccessHandler(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        setDefaultTargetUrl("http://localhost:3000/en");
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String provider = oauthToken.getAuthorizedClientRegistrationId();

        if (email == null) {
            email = oAuth2User.getAttribute("login") + "@github.com";
        }
        if (name == null) {
            name = oAuth2User.getAttribute("login");
        }

        String finalEmail = email;
        String finalName = name;

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(finalEmail);
            newUser.setName(finalName);
            newUser.setProvider(provider);
            newUser.setProviderId(oAuth2User.getName());
            return userRepository.save(newUser);
        });

        String jwt = jwtUtil.generateToken(user.getEmail());

        Cookie cookie = new Cookie("jwt", jwt);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(86400);
        response.addCookie(cookie);

        getRedirectStrategy().sendRedirect(request, response, getDefaultTargetUrl());
    }
}
