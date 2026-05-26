import axiosInstance from "../axiosInstance";

/* ================= API METHODS ================= */

/* GET ALL ADDRESSES */
export const getMyAddresses = () =>
  axiosInstance.get("/api/profile/addresses");

/* ADD ADDRESS */
export const addAddress = (data) =>
  axiosInstance.post("/api/profile/addresses", data);

/* MAKE DEFAULT ADDRESS */
export const makeDefaultAddress = (id) =>
  axiosInstance.put(`/api/profile/addresses/${id}/default`);

/* DELETE ADDRESS */
export const deleteAddress = (id) =>
  axiosInstance.delete(`/api/profile/addresses/${id}`);