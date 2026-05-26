import axiosInstance from "../axiosInstance";

/* GET PHONES */
export const getPhones = () =>
  axiosInstance.get("/api/profile/phones");

/* ADD PHONE */
export const addPhone = (data) =>
  axiosInstance.post("/api/profile/phones", data);

/* MAKE PRIMARY PHONE */
export const makePrimaryPhone = (id) =>
  axiosInstance.put(`/api/profile/phones/${id}/primary`);

/* DELETE PHONE */
export const deletePhone = (id) =>
  axiosInstance.delete(`/api/profile/phones/${id}`);