package com.rajbhog.service;

import com.rajbhog.dto.response.OrderEmailDto;

public interface EmailService {
// FOR LOGIN AND NEW USERS
    void sendOtpEmail(String toEmail, String otp);
    void sendWelcomeEmail(String toEmail);
    
 // For ORDERS
    void sendOrderPlacedEmail(OrderEmailDto dto);
    void sendOrderDeliveredEmail(OrderEmailDto order);
    
    // TICKETS
    
    void sendTicketUpdateEmail(String to, String name, String subject,
            String ticketSubject, String resolutionMessage,
            String status);

}
