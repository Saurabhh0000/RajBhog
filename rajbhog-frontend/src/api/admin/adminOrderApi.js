import adminAxios from "./adminAxios";

export const fetchAllOrders = () =>
  adminAxios.get("/api/admin/orders");

export const updateOrderStatus = (orderNumber, orderStatus) =>
  adminAxios.put(`/api/admin/orders/${orderNumber}/status`, { orderStatus });

export const updatePaymentStatus = (orderNumber, paymentStatus) =>
  adminAxios.put(`/api/admin/orders/${orderNumber}/payment`, { paymentStatus });