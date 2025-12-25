import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Home, Search, PlusCircle, User, LogOut, Map, Package, PackageOpen, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile, logout } from '@/store/authSlice';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector(state => state.auth);
  
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('isDark');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleDarkModeToggle = () => {
    setIsDark(prev => {
      const newState = !prev;
      localStorage.setItem('isDark', JSON.stringify(newState));
      return newState;
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await api.post("/user/logout", null, { withCredentials: true });
  
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
        className: "bg-green-700 text-white border border-green-300"
      });
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      toast({
        title: "Logout failed",
        description: err.response?.data?.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <Home className="mr-2 h-4 w-4" /> },
    { path: '/lost-items', label: 'Lost Items', icon: <Package className="mr-2 h-4 w-4" /> },
    { path: '/found-items', label: 'Found Items', icon: <PackageOpen className="mr-2 h-4 w-4" /> },
    { path: '/create-listing', label: 'Create Listing', icon: <PlusCircle className="mr-2 h-4 w-4" /> },
    { path: '/profile', label: 'Profile', icon: <User className="mr-2 h-4 w-4" /> },
    {path:'/my-claims',label:'My Claims',icon: <User className="mr-2 h-4 w-4" /> },
    {path:'/my-reports',label:'My Reports',icon: <User className="mr-2 h-4 w-4" />}
  ];

  // Determine the current page title based on path
  const getCurrentPageTitle = () => {
    const currentItem = navItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.label : 'FindIt';
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar for desktop */}
      <div className={`hidden md:flex w-64 flex-col bg-white dark:bg-gray-800 border-r dark:border-gray-700`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">FindIt</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Lost & Found App</p>
        </div>
        
        <Separator />
        
        <div className="flex-1 overflow-auto py-2">
          <nav className="px-4 space-y-1">
            {navItems.map(item => (
              <NavLink 
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive 
                      ? 'bg-gray-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400' 
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t dark:border-gray-700">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleDarkModeToggle}
          >
            {isDark ? (
              <>
                <Sun className="mr-2 h-4 w-4" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="mr-2 h-4 w-4" />
                Dark Mode
              </>
            )}
          </Button>
          
          {user && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatar || "/api/placeholder/80/80"} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay sidebar */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-200 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
      
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 z-30 transform transition-transform duration-200 ease-in-out md:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">FindIt</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto py-2">
          <nav className="px-4 space-y-1">
            {navItems.map(item => (
              <NavLink 
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive 
                      ? 'bg-gray-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400' 
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t dark:border-gray-700">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleDarkModeToggle}
          >
            {isDark ? (
              <>
                <Sun className="mr-2 h-4 w-4" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="mr-2 h-4 w-4" />
                Dark Mode
              </>
            )}
          </Button>
          
          {user && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatar || "/api/placeholder/80/80"} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white">{getCurrentPageTitle()}</h1>
          </div>
          <Button variant="outline" size="icon" onClick={handleDarkModeToggle}>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;