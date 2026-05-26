import axios from "../axiosInstance";

// 🌍 Guest + Logged-in
export const submitContact = (data) => {
  return axios.post("/api/contact", data);
};

// 👤 Logged-in only
export const getMyContacts = () => {
  return axios.get("/api/contact/me");
};
