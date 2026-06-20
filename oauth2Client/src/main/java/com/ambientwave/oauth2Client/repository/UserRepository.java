package com.ambientwave.oauth2Client.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ambientwave.oauth2Client.models.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
