package com.rajbhog.service.impl;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.Year;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.rajbhog.dto.response.OrderEmailDto;
import com.rajbhog.exception.EmailSendException;
import com.rajbhog.service.BrevoEmailService;
import com.rajbhog.service.EmailService;
import com.rajbhog.service.InvoiceService;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final InvoiceService invoiceService;
    private final BrevoEmailService brevoEmailService;

    // ---------- OTP EMAIL ----------
    @Override
    public void sendOtpEmail(String toEmail, String otp) {

        try {
            String html = loadTemplate("email/otp-email.html")
                    .replace("{{OTP}}", otp)
                    .replace("{{YEAR}}", String.valueOf(Year.now().getValue()));

            sendHtmlEmail(toEmail, "Rajbhog OTP Verification", html);

        } catch (Exception ex) {

            ex.printStackTrace();

            throw new RuntimeException(
                    "OTP EMAIL FAILED: " + ex.getMessage());
        }
    }

    // ---------- WELCOME EMAIL ----------
    @Override
    public void sendWelcomeEmail(String toEmail) {

        try {
            String html = loadTemplate("email/welcome-email.html")
                    .replace("{{YEAR}}", String.valueOf(Year.now().getValue()));

            sendHtmlEmail(toEmail, "Welcome to Rajbhog 🎉", html);

        } catch (Exception ex) {

            ex.printStackTrace();

            throw new RuntimeException(
                    "WELCOME EMAIL FAILED: " + ex.getMessage());
        }
    }

    // --------------- TICKETS EMAIL -------------

    @Override
    public void sendTicketUpdateEmail(String to, String name, String subject,
            String ticketSubject, String resolutionMessage,
            String status) {

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            String statusColor = status.equals("RESOLVED") ? "#16a34a" : "#dc2626";

            String htmlContent = """
                    <div style="font-family:Arial,sans-serif; padding:20px;">
                        <h2 style="color:#16a34a;">Rajbhog Support</h2>

                        <p>Hi <b>%s</b>,</p>

                        <p>Your support request regarding
                        <b>"%s"</b> has been
                        <span style="color:%s;"><b>%s</b></span>.</p>

                        <div style="background:#f0fdf4; padding:12px; border-radius:8px; border:1px solid #bbf7d0;">
                            <b>Resolution:</b><br/>
                            %s
                        </div>

                        <p style="margin-top:20px;">
                            If you still need help, feel free to contact us again.
                        </p>

                        <p>Regards,<br/><b>Rajbhog Support Team</b></p>
                    </div>
                    """.formatted(name, ticketSubject, statusColor, status, resolutionMessage);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // ✅ TRUE = HTML

            mailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    // --------------- ORDER PLACED EMAIL -------------

    @Override
    @Async
    public void sendOrderPlacedEmail(OrderEmailDto dto) {

        try {

            // ✅ PAYMENT METHOD (FROM DTO - NO DB CALL)
            String paymentMethod = "Online"; // or pass in DTO if needed

            String html = loadTemplate("email/order-placed.html")
                    .replace("{{ORDER_NUMBER}}", dto.getOrderNumber())
                    .replace("{{PAYMENT_METHOD}}", paymentMethod)
                    .replace("{{ITEMS}}", buildItemsHtml(dto))
                    .replace("{{SUBTOTAL}}", dto.getSubtotal().toString())
                    .replace("{{DELIVERY}}", dto.getDelivery().toString())
                    .replace("{{DISCOUNT}}", dto.getDiscount().toString())
                    .replace("{{TOTAL}}", dto.getTotal().toString())
                    .replace("{{ADDRESS}}", dto.getAddress())
                    .replace("{{YEAR}}", String.valueOf(Year.now().getValue()));

            // 🔥 GENERATE PDF USING DTO (FIX BELOW)
            byte[] pdf = invoiceService.generateInvoiceFromDto(dto);

            sendHtmlEmailWithAttachment(
                    dto.getCustomerEmail(),
                    "Order Confirmed 🎉 | Invoice Attached",
                    html,
                    pdf,
                    "Invoice-" + dto.getOrderNumber() + ".pdf");

        } catch (Exception ex) {
            throw new EmailSendException("Failed to send order email");
        }
    }

    // --------------- ORDER DELIVERED EMAIL ----------------------

    @Override
    @Async
    public void sendOrderDeliveredEmail(OrderEmailDto dto) {

        try {

            String html = loadTemplate("email/order-delivered.html")
                    .replace("{{ORDER_NUMBER}}", dto.getOrderNumber())
                    .replace("{{TOTAL}}", dto.getTotal().toString())
                    .replace("{{ITEMS}}", buildItemsHtml(dto))
                    .replace("{{YEAR}}", String.valueOf(Year.now().getValue()));

            sendHtmlEmail(
                    dto.getCustomerEmail(),
                    "Order Delivered ✅",
                    html);

        } catch (Exception ex) {
            ex.printStackTrace();
            throw new EmailSendException("Failed to send delivered email");
        }
    }

    // ---------- COMMON HTML EMAIL METHOD ----------
    private void sendHtmlEmail(String to, String subject, String html) {

        brevoEmailService.sendEmail(to, subject, html);
    }

    private void sendHtmlEmailWithAttachment(
            String to,
            String subject,
            String html,
            byte[] attachment,
            String fileName) {

        // MimeMessage message = mailSender.createMimeMessage();

        // MimeMessageHelper helper = new MimeMessageHelper(message, true,
        // StandardCharsets.UTF_8.name());

        // helper.setTo(to);
        // helper.setSubject(subject);
        // helper.setText(html, true);

        // // 🔥 ATTACH FILE
        // helper.addAttachment(fileName, new ByteArrayResource(attachment));

        // mailSender.send(message);
        brevoEmailService.sendEmail(to, subject, html);
    }

    // ---------- TEMPLATE LOADER ----------
    private String loadTemplate(String path) {

        try (InputStream is = new ClassPathResource(path).getInputStream()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception ex) {
            throw new EmailSendException();
        }
    }

    private String buildItemsHtml(OrderEmailDto dto) {

        StringBuilder items = new StringBuilder();

        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            return "<tr><td colspan='4'>No items found</td></tr>";
        }

        dto.getItems().forEach(item -> {
            items.append("""
                        <tr>
                            <td>%s</td>
                            <td>%s</td>
                            <td>%d</td>
                            <td>₹%.2f</td>
                        </tr>
                    """.formatted(
                    item.getName(),
                    item.getUnit(),
                    item.getQuantity(),
                    item.getPrice()));
        });

        return items.toString();
    }
}
