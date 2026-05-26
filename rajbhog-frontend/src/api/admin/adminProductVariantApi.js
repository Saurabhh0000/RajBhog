import adminAxios from "./adminAxios";

export const fetchVariantsByProduct = (productId) =>
  adminAxios.get(`/api/admin/product-variants/product/${productId}`);

export const createVariant = (data) =>
  adminAxios.post("/api/admin/product-variants", data);

export const updateVariant = (id, data) =>
  adminAxios.put(`/api/admin/product-variants/${id}`, data);

export const toggleVariantStatus = (id) =>
  adminAxios.patch(`/api/admin/product-variants/${id}/toggle`);