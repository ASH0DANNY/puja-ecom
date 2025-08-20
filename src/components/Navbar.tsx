import { Link } from "react-router-dom";
import { menuItems } from "../constants/menuItems";
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  UserIcon,
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
  const cartItemsCount = items.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-primary px-4 py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={onMenuClick} className="lg:hidden text-white mr-4">
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
          <Link to="/" className="text-2xl font-bold text-white">
            Fashion Store
          </Link>
        </div>
        <div className="hidden lg:flex space-x-8 items-center">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="text-white hover:text-gray-200"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-white hover:text-gray-200">
            <MagnifyingGlassIcon className="h-6 w-6" />
          </button>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/cart"
                  className="text-white hover:text-gray-200 relative"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
                <div className="relative group">
                  <button className="text-white hover:text-gray-200">
                    <UserIcon className="h-6 w-6" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      {user.email}
                    </div>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Orders
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link to="/login" className="text-white hover:text-gray-200">
                <UserIcon className="h-6 w-6" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
