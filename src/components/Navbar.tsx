import { useState } from "react";
import { Link } from "react-router-dom";
import { menuItems } from "../constants/menuItems";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import type { CartItem } from "../types/product";
import {
  ShoppingCart,
  Search,
  Menu,
  User,
  ShoppingBag,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import LogoImage from "../assets/images/Circular-Logo.png";

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">
          {/* Left Section - Menu Button & Desktop Navigation */}
          <div className="flex items-center lg:flex-1">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100/80 focus:outline-none transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden lg:flex items-center space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className="text-gray-600 hover:text-primary transition-colors duration-200 font-medium text-sm"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Center Section - Logo (Centered on mobile only) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 lg:relative lg:left-0 lg:transform-none">
            <Link to="/" className="flex items-center">
              <img src={LogoImage} alt="Logo" className="h-16 w-auto lg:h-30" />
            </Link>
          </div>

          {/* Right Section - Search, Cart & Profile */}
          <div className="flex items-center space-x-1 lg:flex-1 lg:justify-end">
            {/* Search - Desktop */}
            <div className="hidden md:flex items-center mr-2">
              <Link to="/search" className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-64 pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
                    readOnly
                  />
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </Link>
            </div>

            {/* Search Icon - Mobile */}
            <Link
              to="/search"
              className="md:hidden p-2.5 rounded-xl hover:bg-gray-100/80 text-gray-600 hover:text-primary transition-colors"
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* Cart - Always visible */}
            <Link
              to="/cart"
              className="p-2.5 rounded-xl hover:bg-gray-100/80 text-gray-600 hover:text-primary transition-colors relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Profile - Only visible on desktop */}
            {user ? (
              <div className="relative hidden lg:block">
                <button
                  onClick={toggleProfile}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-100/80 transition-colors"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/10"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10 backdrop-blur-md">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.displayName || user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-2 space-y-1">
                      <Link
                        to="/orders"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        My Orders
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden lg:flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-xl transition-all duration-200 font-medium text-sm"
              >
                <User className="h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
