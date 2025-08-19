import { Link } from "react-router-dom";
import { menuItems } from "../constants/menuItems";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:hidden bg-white w-64 transition-transform duration-300 ease-in-out z-50`}
    >
      <div className="p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="mt-8 space-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="block text-gray-800 hover:text-primary"
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
