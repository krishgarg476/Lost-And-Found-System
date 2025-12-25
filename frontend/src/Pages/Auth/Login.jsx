import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { useDispatch } from "react-redux";
import { fetchProfile } from "@/store/authSlice";
const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate(); // Use React Router's navigate
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Login attempt with:", formData);
      const { data } = await api.post("/user/login", formData);
      dispatch(fetchProfile())
      // Save token if your API returns one
      // if (data.token) {
      //   localStorage.setItem("token", data.token);
      // }
      
      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      });
      
      // Use setTimeout to allow the toast to be visible
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-0 shadow-lg dark:border dark:border-gray-700 dark:shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              className="dark:border-gray-600"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="dark:border-gray-600"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
              Register here
            </Link>
          </div>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <Link to="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline">
              Forgot Password
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default Login;