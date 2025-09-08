import { Link } from "react-router-dom";
import { menuItems } from "../constants/menuItems";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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

        {/* Menu Items */}
        <div className="space-y-4">
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

        {/* Profile Section */}
        {user && (
          <div className="mt-6">
            <div className="flex items-center space-x-3 mb-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="text-lg font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="space-y-1 border-b border-gray-200 pb-4">
              <Link
                to="/orders"
                className="block text-gray-700 hover:text-primary"
                onClick={onClose}
              >
                My Orders
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/dashboard"
                  className="block text-gray-700 hover:text-primary"
                  onClick={onClose}
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left text-red-600 hover:text-red-700"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
