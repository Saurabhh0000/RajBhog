import axiosInstance from "../axiosInstance";

export const getBannerCoupons = () =>
  axiosInstance.get("/api/user/coupons/banners");

/* GET AVAILABLE COUPONS */
export const getAvailableCoupons = (cartAmount) =>
  axiosInstance.get(`/api/user/coupons/available?cartAmount=${cartAmount}`);

/* APPLY COUPON */
export const applyCoupon = (data) =>
  axiosInstance.post("/api/user/coupons/apply", data);