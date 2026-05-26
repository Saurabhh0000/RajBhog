package com.rajbhog.bootstrap;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.rajbhog.entity.User;
import com.rajbhog.enums.Role;
import com.rajbhog.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;

    @org.springframework.beans.factory.annotation.Value("${admin.email}")
    private String adminEmail;

    @org.springframework.beans.factory.annotation.Value("${admin.name}")
    private String adminName;

    @Override
    public void run(String... args) {

        boolean adminExists = userRepository.existsByEmail(adminEmail);

        if (adminExists) {
            return; // ✅ Already created, do nothing
        }

        User admin = userRepository.findByEmail(adminEmail)
        	    .map(existing -> {
        	        if (existing.getRole() != Role.ADMIN) {
        	            existing.setRole(Role.ADMIN);
        	            return userRepository.save(existing);
        	        }
        	        return existing;
        	    })
        	    .orElseGet(() -> userRepository.save(
        	        User.builder()
        	            .email(adminEmail)
        	            .fullName(adminName)
        	            .role(Role.ADMIN)
        	            .isVerified(true)
        	            .build()
        	    ));

    }
}
