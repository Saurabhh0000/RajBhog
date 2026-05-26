import axiosInstance from "../axiosInstance";

/* ================= ADD REVIEW ================= */
export const addReview = (data) => {
  return axiosInstance.post("/api/reviews", data);
};

/* ================= GET REVIEWS BY VARIANT ================= */
export const getReviewsByVariant = (variantId) => {
  return axiosInstance.get(`/api/reviews/variant/${variantId}`);
};

/* ================= GET MY REVIEWS ================= */
export const getMyReviews = () => {
  return axiosInstance.get("/api/reviews/me");
};