package com.rajbhog.service.impl;

import java.util.Map;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.rajbhog.service.BrevoEmailService;

@Service
public class BrevoEmailServiceImpl implements BrevoEmailService {

        @Value("${brevo.api-key}")
        private String apiKey;

        private final WebClient webClient = WebClient.builder()
                        .baseUrl("https://api.brevo.com/v3/smtp/email")
                        .build();

        @Value("${brevo.sender-email}")
        private String senderEmail;

        @Value("${brevo.sender-name}")
        private String senderName;

        @Override
        public void sendEmail(String to, String subject, String htmlContent) {

                Map<String, Object> body = Map.of(
                                "sender", Map.of(
                                                "name", senderName,
                                                "email", senderEmail),
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

        @Override
        public void sendEmailWithAttachment(
                        String to,
                        String subject,
                        String htmlContent,
                        byte[] attachment,
                        String fileName) {

                String base64File = Base64.getEncoder().encodeToString(attachment);

                Map<String, Object> body = Map.of(

                                "sender", Map.of(
                                                "name", senderName,
                                                "email", senderEmail),

                                "to", new Object[] {
                                                Map.of("email", to)
                                },

                                "subject", subject,

                                "htmlContent", htmlContent,

                                "attachment", new Object[] {
                                                Map.of(
                                                                "name", fileName,
                                                                "content", base64File)
                                });

                webClient.post()
                                .contentType(MediaType.APPLICATION_JSON)
                                .header("api-key", apiKey)
                                .bodyValue(body)
                                .retrieve()
                                .bodyToMono(String.class)
                                .block();

                System.out.println(
                                "Email with attachment sent to: " + to);
        }
}