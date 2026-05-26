import adminAxios from "./adminAxios";

export const fetchCoupons = () =>
  adminAxios.get("/api/admin/coupons");

export const createCoupon = (data) =>
  adminAxios.post("/api/admin/coupons", data);

export const updateCoupon = (id, data) =>
  adminAxios.put(`/api/admin/coupons/${id}`, data);

export const toggleCouponStatus = (id) =>
  adminAxios.patch(`/api/admin/coupons/${id}/toggle`);