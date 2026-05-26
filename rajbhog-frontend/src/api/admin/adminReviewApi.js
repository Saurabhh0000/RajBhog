import adminAxios from "./adminAxios";

export const fetchAllReviews = () =>
  adminAxios.get("/api/admin/reviews");

export const updateReviewStatus = (id, approved) =>
  adminAxios.patch(`/api/admin/reviews/${id}`, { approved });