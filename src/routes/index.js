import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "../App";
import Buy from "../pages/Buy";
import Cart from "../pages/Cart";
import Sell from "../pages/Sell";
import ProductDetail from "../pages/ProductDetail";
import SellerDetail from "../pages/SellerDetail";
import Layout from "../components/Layout";
import FlashSale from "../pages/FlashSale";
import HotProducts from "../pages/HotProducts";
import NewProducts from "../pages/NewProducts";
import OrderConfirmation from "../pages/OrderConfirmation";
import PublishSuccess from "../pages/PublishSuccess";
import Admin from "../pages/Admin";
import MyOrders from "../pages/MyOrders";
import OrderManagement from "../pages/OrderManagement";

const AppRoutes = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/buy" element={<Buy />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/seller-detail/:walletAddress" element={<SellerDetail />} />
          <Route path="/flash-sale" element={<FlashSale />} />
          <Route path="/hot-products" element={<HotProducts />} />
          <Route path="/new-products" element={<NewProducts />} />
          <Route path="/publish-success" element={<PublishSuccess />} />
          <Route path="/order/:id" element={<OrderConfirmation />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/order-management" element={<OrderManagement />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default AppRoutes;
