import { Link } from "react-router-dom";
import { menuItems } from "../constants/menuItems";
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";
import type { CartItem } from "../types/product";

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { items } = useCart();
  const cartItemsCount = items.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0
  );

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
          <Link to="/cart" className="text-white hover:text-gray-200 relative">
            <ShoppingCartIcon className="h-6 w-6" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
