// src/api/user/paymentApi.js
import axiosInstance from "../axiosInstance";

/* ================= CREATE PAYMENT ================= */
export const createPayment = (orderNumber, data) => {
  return axiosInstance.post(`/api/payments/${orderNumber}`, data);
};

/* ================= RAZORPAY ORDER ================= */
export const createRazorpayOrder = (orderNumber) => {
  return axiosInstance.post(`/api/payments/${orderNumber}/razorpay`);
};

/* ================= VERIFY PAYMENT ================= */
export const verifyPayment = (data) => {
  return axiosInstance.post(`/api/payments/razorpay/verify`, null, {
    params: data,
  });
};