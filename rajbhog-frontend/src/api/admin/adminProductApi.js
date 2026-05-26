import adminAxios from "./adminAxios";

export const fetchProducts = () =>
  adminAxios.get("/api/admin/products");

export const createProduct = (data) =>
  adminAxios.post("/api/admin/products", data);

export const updateProduct = (id, data) =>
  adminAxios.put(`/api/admin/products/${id}`, data);

export const toggleProductStatus = (id) =>
  adminAxios.patch(`/api/admin/products/${id}/toggle`);