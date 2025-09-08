import { useState } from "react";
import { Link } from "react-router-dom";
import { menuItems } from "../constants/menuItems";
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import type { CartItem } from "../types/product";

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { items } = useCart();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const cartItemsCount = items.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0
  );

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <nav className="backdrop-blur-md bg-white/80 border-b border-gray-200/50 fixed w-full z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20 md:h-24">
          {/* Left Section - Logo & Menu */}
          <div className="flex items-center justify-between w-full lg:w-auto lg:justify-start">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <Link
              to="/"
              className="flex items-center justify-center flex-1 lg:flex-none lg:justify-start"
            >
              <img
                src="https://thekkgroups.in/cdn/shop/files/kk_logo_png.png?v=1696485501&width=500"
                alt="Logo"
                className="h-16 w-auto lg:h-12"
              />
            </Link>

            <div className="hidden lg:flex items-center space-x-6 ml-6">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className="text-gray-600 hover:text-primary transition-colors duration-200 font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section - Search, Cart & Profile */}
          <div className="flex items-center space-x-1">
            {/* Search - Desktop */}
            <div className="hidden md:flex items-center">
              <Link to="/search" className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer"
                    readOnly
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </Link>
            </div>

            {/* Search Icon - Mobile */}
            <Link
              to="/search"
              className="md:hidden p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-primary transition-colors"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </Link>

            {/* Cart - Always visible */}
            <Link
              to="/cart"
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-primary transition-colors relative"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Profile - Only visible on desktop */}
            {user ? (
              <div className="relative hidden lg:block">
                <button
                  onClick={toggleProfile}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      My Orders
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden lg:block text-gray-600 hover:text-primary transition-colors font-medium text-sm md:text-base"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
