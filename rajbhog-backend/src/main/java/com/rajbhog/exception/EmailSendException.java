package com.rajbhog.exception;

public class EmailSendException extends ApiException {

    public EmailSendException() {
        super("Unable to send email at the moment. Please try again later.");
    }

    // 🔥 ADD THIS (VERY IMPORTANT)
    public EmailSendException(String msg) {
        super(msg);
    }
}