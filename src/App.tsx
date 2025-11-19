import { useState } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
  ScrollRestoration,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { AuthReduxInitializer } from "./redux/AuthReduxInitializer";
import { CartReduxInitializer } from "./redux/CartReduxInitializer";
import { DiscountReduxInitializer } from "./redux/DiscountReduxInitializer";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import MainLayout from "./layouts/MainLayout";
import CategoriesPage from "./pages/CategoriesPage";
import ContactPage from "./pages/ContactPage";
import OrdersPage from "./pages/OrdersPage";
import SuggestionsPage from "./pages/SuggestionsPage";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SearchPage from "./pages/SearchPage";
import ProductDetails from "./pages/ProductDetails";
import PaymentPage from "./pages/PaymentPage";

import ProtectedRoute from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsAndConditionsPage from "./pages/TermsAndConditionsPage";
import AllProductsPage from "./pages/AllProductsPage";

function RootLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <AuthReduxInitializer>
      <CartReduxInitializer>
        <DiscountReduxInitializer>
          <ScrollRestoration />
          <div className="min-h-screen bg-white">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#333",
                  color: "#fff",
                },
              }}
            />
            <Navbar onMenuClick={toggleSidebar} />
            <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
            <MainLayout>
              <Outlet />
            </MainLayout>
            <Footer />
          </div>
        </DiscountReduxInitializer>
      </CartReduxInitializer>
    </AuthReduxInitializer>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/suggestions" element={<SuggestionsPage />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        }
      />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsAndConditionsPage />} />
      <Route path="/all-products" element={<AllProductsPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireAdmin={true}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  )
);

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
