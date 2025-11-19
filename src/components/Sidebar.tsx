import { Link } from "react-router-dom";
import { menuItems } from "../constants/menuItems";
import { useReduxAuth } from "../redux/useReduxAuth";
import { X, ShoppingBag, LayoutDashboard, LogOut } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout } = useReduxAuth();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:hidden bg-white w-80 transition-transform duration-300 ease-in-out z-50 shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-primary/5 p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="px-6 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary/10 hover:text-primary rounded-xl transition-all duration-200 font-medium"
                  onClick={onClose}
                >
                  {/* You can add icons here if menuItems has icon property */}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Profile Section */}
          <div className="border-t border-gray-100 bg-gray-50/50">
            {user ? (
              <div className="p-6">
                {/* User Info */}
                <div className="flex items-center gap-4 mb-6">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.displayName || user.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Profile Actions */}
                <div className="space-y-2">
                  <Link
                    to="/orders"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white hover:text-primary rounded-xl transition-all duration-200 font-medium"
                    onClick={onClose}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>My Orders</span>
                  </Link>

                  {user.role === "admin" && (
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white hover:text-primary rounded-xl transition-all duration-200 font-medium"
                      onClick={onClose}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200 font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Login/Signup Options */
              <div className="p-6 space-y-4">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors duration-200"
                  onClick={onClose}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-primary border-2 border-primary hover:bg-primary/5 rounded-xl transition-colors duration-200"
                  onClick={onClose}
                >
                  <span>Create Account</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
