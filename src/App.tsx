import { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Hero from "./components/Hero";
import FeaturedCategories from "./components/FeaturedCategories";
import Footer from "./components/Footer";
import MainLayout from "./layouts/MainLayout";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar onMenuClick={toggleSidebar} />
        <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
        <MainLayout>
          <Hero />
          <FeaturedCategories />
        </MainLayout>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
