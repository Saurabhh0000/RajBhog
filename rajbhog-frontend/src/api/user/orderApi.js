import axiosInstance from "../axiosInstance";

/* PLACE ORDER */
export const placeOrder = (data) => {
  return axiosInstance.post("/api/orders", data);
};

/* GET MY ORDERS */
export const getMyOrders = () =>
  axiosInstance.get("/api/orders");

/* GET ORDER BY NUMBER */
export const getOrderByNumber = (orderNumber) =>
  axiosInstance.get(`/api/orders/${orderNumber}`);

/* CANCEL ORDER */
export const cancelOrder = (orderNumber) =>
  axiosInstance.put(`/api/orders/${orderNumber}/cancel`);

/* DOWNLOAD / VIEW INVOICE */
export const getInvoice = (orderNumber) =>
  axiosInstance.get(`/api/orders/${orderNumber}/invoice`, {
    responseType: "blob", // 🔥 VERY IMPORTANT
  });

export const requestReturn = (orderNumber, reason) => {
  return axiosInstance.post(
    `/api/orders/${orderNumber}/return`,
    null,
    {
      params: { reason },
    }
  );
};