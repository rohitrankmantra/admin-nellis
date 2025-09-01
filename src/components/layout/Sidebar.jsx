import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Car,
  Store,
  Wrench,
  FileText,
  Mail,
  Gift,
  Video,
  Building,
  Menu,
  X,
  LogOut,
  Cog,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

  const navigationItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: Home },
    { name: "Weekly Specials", path: "/admin/specials", icon: Video },
    { name: "Inventory", path: "/admin/inventory", icon: Car },
    { name: "Special Offers", path: "/admin/offers", icon: Gift },
    { name: "Dealerships", path: "/admin/dealerships", icon: Building },
    { name: "Auto Businesses", path: "/admin/businesses", icon: Store },
    { name: "Service", path: "/admin/service", icon: Wrench },
    { name: "Parts", path: "/admin/parts", icon: Cog },
    { name: "Community Blog", path: "/admin/blog", icon: FileText },
    { name: "Contact Submissions", path: "/admin/contacts", icon: Mail },
  ];

  const NavItem = ({ item, mobile = false }) => {
    const Icon = item.icon;
    return (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
            isActive
              ? "bg-primary-100 text-primary-700 border-r-2 border-primary-700"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          } ${mobile ? "mb-2" : ""}`
        }
        onClick={() => mobile && setIsOpen(false)}
      >
        <Icon className="w-5 h-5 mr-3" />
        {item.name}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border border-gray-200"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-1 pt-6 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="flex items-center">
              <Car className="w-8 h-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Nellis Auto Admin
              </span>
            </div>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            {navigationItems.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
          <div className="px-4 pt-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 pt-16 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="flex items-center">
              <Car className="w-8 h-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Nellis Auto Admin
              </span>
            </div>
          </div>
          <nav className="flex-1 px-4">
            {navigationItems.map((item) => (
              <NavItem key={item.name} item={item} mobile />
            ))}
          </nav>
          <div className="px-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
