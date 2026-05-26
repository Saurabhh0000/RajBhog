import axiosInstance from "../axiosInstance";

export const getMyProfile = () =>
  axiosInstance.get("/api/profile/me");

export const updateFullName = (fullName) =>
  axiosInstance.put(`/api/profile/name?fullName=${encodeURIComponent(fullName)}`);