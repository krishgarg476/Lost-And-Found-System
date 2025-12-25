import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";

const AuthLayout = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('isDark');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  const handleDarkModeToggle = () => {
    setIsDark(prev => {
      const newState = !prev;
      localStorage.setItem('isDark', JSON.stringify(newState));
      return newState;
    });
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-100 dark:bg-blue-900 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-100 dark:bg-purple-900 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleDarkModeToggle}
          className="rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 shadow-sm"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-800 dark:text-white">
            FindIt
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Your campus companion
          </p>
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;