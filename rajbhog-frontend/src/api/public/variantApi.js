import axiosInstance from "../axiosInstance";

export const getVariantsByProduct = (productId) =>
  axiosInstance.get(`/api/variants/product/${productId}`);