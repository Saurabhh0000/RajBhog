import axiosInstance from "../axiosInstance";

export const fetchWallet = () =>
  axiosInstance.get("/api/wallet");

export const fetchWalletTransactions = () =>
  axiosInstance.get("/api/wallet/transactions");