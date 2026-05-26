package com.rajbhog.service;

public interface BrevoEmailService {

    void sendEmail(String to, String subject, String htmlContent);

    void sendEmailWithAttachment(
            String to,
            String subject,
            String htmlContent,
            byte[] attachment,
            String fileName);

}
