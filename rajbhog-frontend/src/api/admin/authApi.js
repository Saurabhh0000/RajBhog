import axios from "axios";

const authApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const sendOtp = (email) =>
  authApi.post("/send-otp", { email });

export const verifyOtp = (email, otp) =>
  authApi.post("/verify-otp", { email, otp });
