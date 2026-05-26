import axios from "axios";

const authApi = axios.create({
  baseURL: "http://localhost:8080/api/auth",
  headers: {
    "Content-Type": "application/json",
  },
});

export const sendOtp = (email) =>
  authApi.post("/send-otp", { email });

export const verifyOtp = (email, otp) =>
  authApi.post("/verify-otp", { email, otp });
