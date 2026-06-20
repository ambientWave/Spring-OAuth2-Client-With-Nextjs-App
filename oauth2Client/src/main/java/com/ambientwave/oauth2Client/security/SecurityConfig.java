package com.ambientwave.oauth2Client.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
            OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.oAuth2AuthenticationSuccessHandler = oAuth2AuthenticationSuccessHandler;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/login", "/register", "/oauth2/**").permitAll()
                        .anyRequest().authenticated())
                /*
                 * 1. Should you add loginPage(), defaultSuccessUrl, and failureUrl?
                 * defaultSuccessUrl: You do not need this because you are already using a
                 * custom .successHandler(oAuth2AuthenticationSuccessHandler). The custom
                 * success handler is fully responsible for issuing the JWT cookie and
                 * redirecting the user, making defaultSuccessUrl redundant.
                 * loginPage(): Yes, this is highly recommended. By default, if an
                 * unauthenticated user tries to access a protected endpoint, Spring will try to
                 * redirect them to its auto-generated HTML login page. By setting
                 * .loginPage("http://localhost:3000/en/login"), you tell Spring to redirect
                 * unauthenticated users to the Next.js login page instead.
                 * failureUrl(): Yes, this is also a great idea. If the OAuth2 flow fails (e.g.,
                 * the user denies access on GitHub/Google), Spring needs to know where to send
                 * them. Redirecting them back to the Next.js login page with an error query
                 * parameter is the best approach.
                 * 2. Should you add logout?
                 * We already created a /api/auth/logout endpoint in AuthController that
                 * clears the jwt cookie. Because we are using stateless JWTs (no server-side
                 * sessions), this controller method is actually sufficient.
                 * 
                 * However, if you want to use Spring Security's built-in logout mechanism
                 * instead, you can define it here and remove the method from the controller.
                 * It's often cleaner to let Spring Security handle it.
                 */
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("http://localhost:3000/en/login")
                        .successHandler(oAuth2AuthenticationSuccessHandler))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
