import adminAxios from "./adminAxios";

export const fetchCategories = () =>
  adminAxios.get("/api/admin/categories");

export const createCategory = (data) =>
  adminAxios.post("/api/admin/categories", data);

export const updateCategory = (id, data) =>
  adminAxios.put(`/api/admin/categories/${id}`, data);

export const toggleCategoryStatus = (id) =>
  adminAxios.patch(`/api/admin/categories/${id}/toggle`);