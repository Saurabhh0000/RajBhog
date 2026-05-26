import adminAxios from "./adminAxios";

export const fetchAllPayments = () =>
  adminAxios.get("/api/admin/payments");

export const updatePaymentStatus = (orderNumber, paymentStatus) =>
  adminAxios.patch(`/api/admin/payments/order/${orderNumber}`, {
    paymentStatus,
  });