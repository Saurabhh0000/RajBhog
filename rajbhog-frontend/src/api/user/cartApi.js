import axiosInstance from "../axiosInstance";

/* ================= API METHODS ================= */

/* GET CART */
export const getMyCart = () =>
  axiosInstance.get("/api/cart");

/* ADD TO CART */
export const addToCart = (data) =>
  axiosInstance.post("/api/cart", data);

/* UPDATE QUANTITY */
export const updateQuantity = (id, quantity) =>
  axiosInstance.put(`/api/cart/${id}?quantity=${quantity}`);

/* REMOVE ITEM */
export const removeItem = (id) =>
  axiosInstance.delete(`/api/cart/${id}`);

/* CLEAR CART */
export const clearCart = () =>
  axiosInstance.delete("/api/cart/clear");