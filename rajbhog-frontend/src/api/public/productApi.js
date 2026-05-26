import axiosInstance from "../axiosInstance";

export const getProductsByCategory = (categoryId) =>
  axiosInstance.get(`/api/products/category/${categoryId}`);

export const getProductsByCategorySlug = (slug) =>
  axiosInstance.get(`/api/products/category/slug/${slug}`);

export const getProductBySlug = (slug) =>
  axiosInstance.get(`/api/products/slug/${slug}`);