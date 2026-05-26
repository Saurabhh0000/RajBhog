import adminAxios from "./adminAxios";

export const fetchAllContacts = () =>
  adminAxios.get("/api/admin/contacts");

export const updateContactStatus = (id, data) =>
  adminAxios.patch(
    `/api/admin/contacts/${id}/status`,
    JSON.stringify(data),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );