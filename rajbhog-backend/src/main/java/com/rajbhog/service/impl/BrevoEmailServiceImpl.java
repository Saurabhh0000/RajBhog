package com.rajbhog.service.impl;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.rajbhog.service.BrevoEmailService;

@Service
public class BrevoEmailServiceImpl implements BrevoEmailService {

    @Value("${BREVO_API_KEY}")
    private String apiKey;

    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://api.brevo.com/v3/smtp/email")
            .build();

    @Override
    public void sendEmail(String to, String subject, String htmlContent) {

        Map<String, Object> body = Map.of(
                "sender", Map.of(
                        "name", "RajBhog",
                        "email", "rajbhogstore@gmail.com"),
                "to", new Object[] {
                        Map.of("email", to)
                },
                "subject", subject,
                "htmlContent", htmlContent);

        webClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .header("api-key", apiKey)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }
}