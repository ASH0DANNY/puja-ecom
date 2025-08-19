import { Link } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
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
          <h1 className="text-2xl font-bold text-white">Fashion Store</h1>
        </div>
        <div className="hidden lg:flex space-x-8">
          <Link to="/" className="text-white hover:text-gray-200">
            Home
          </Link>
          <Link to="/shop" className="text-white hover:text-gray-200">
            Shop
          </Link>
          <Link to="/categories" className="text-white hover:text-gray-200">
            Categories
          </Link>
          <Link to="/contact" className="text-white hover:text-gray-200">
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
