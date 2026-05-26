package com.rajbhog.exception;

public class InvalidOtpException extends ApiException {

    public InvalidOtpException() {
        super("Invalid or expired OTP");
    }
}
