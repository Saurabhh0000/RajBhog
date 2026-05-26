import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Home from "../pages/Home";

/* ADMIN */
import AdminDashboard from "../pages/AdminDashboard";
import AdminCategories from "../pages/AdminCategories";
import AdminProducts from "../pages/AdminProducts";
import AdminOrders from "../pages/AdminOrders";
import AdminPayments from "../pages/AdminPayments";
import AdminCoupons from "../pages/AdminCoupons";
import AdminReviews from "../pages/AdminReviews";
import AdminContacts from "../pages/AdminContacts";
import AdminSettings from "../pages/AdminSettings";
import AdminLayout from "../layouts/AdminLayout";

/* USER */
import UserDashboard from "../pages/UserDashboard";
import UserLayout from "../layouts/UserLayout";
import ProfileSetupDialog from "../pages/ProfileSetupDialog";
import UserSettings from "../pages/UserSettings";
import CategoryProducts from "../pages/CategoryProducts";
import UserCheckout from "../pages/UserCheckout";
import ProtectedRoute from "./ProtectedRoute";
import ProductDetail from "../pages/ProductDetail";
import UserCart from "../pages/UserCart";
import OrderDetail from "../pages/OrderDetail";
import UserOrders from "../pages/UserOrders";
import MyContacts from "../pages/MyContacts";
import UserCategories from "../pages/UserCategories";
import UserContactUs from "../pages/UserContactUs";
import UserWallet from "../pages/UserWallet";

/* PUBLIC */
import ProductList from "../pages/ProductList";
import PublicProductDetail from "../pages/PublicProductDetail";
import ContactUs from "../pages/ContactUs";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products/:slug" element={<ProductList />} />
        <Route path="/product/:slug" element={<PublicProductDetail />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminLayout />
            </ProtectedRoute>
          }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* USER */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <UserLayout />
            </ProtectedRoute>
          }>
          <Route path="dashboard" element={<UserDashboard />} />

          {/* CATEGORY → PRODUCTS */}

          <Route path="category/:slug" element={<CategoryProducts />} />

          {/* PRODUCT DETAIL */}
          <Route path="product/:slug" element={<ProductDetail />} />
          {/* CART */}
          <Route path="cart" element={<UserCart />} />

          <Route path="checkout" element={<UserCheckout />} />
          <Route path="orders/:orderNumber" element={<OrderDetail />} />
          <Route path="orders" element={<UserOrders />} />
          <Route path="categories" element={<UserCategories />} />
          <Route path="support" element={<UserContactUs />} />
          <Route path="wallet" element={<UserWallet />} />

          <Route path="profile-setup" element={<ProfileSetupDialog />} />

          <Route path="settings" element={<UserSettings />} />
          <Route path="my-contacts" element={<MyContacts />} />

          {/* future */}
          {/* <Route path="orders" element={<UserOrders />} /> */}
          {/* <Route path="profile" element={<UserProfile />} /> */}
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
