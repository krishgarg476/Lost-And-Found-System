import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

// Define form validation schema with Zod
const formSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  
  email: z.string()
    .email({ message: "Please enter a valid email address" }),
  
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    }),
  
  roll_number: z.string()
    .min(3, { message: "Roll number is required" })
    .max(20, { message: "Roll number cannot exceed 20 characters" }),
  
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, { 
      message: "Please enter a valid 10-digit Indian phone number" 
    }),
  
  hostel: z.string()
    .min(1, { message: "Hostel information is required" }),
  
  room_number: z.string()
    .min(1, { message: "Room number is required" })
});

const Register = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Initialize form with zod resolver
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roll_number: "",
      phone: "",
      hostel: "",
      room_number: ""
    }
  });
  
  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await api.post("/user/register", values);
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account",
      });
      navigate("/verify-email", { state: { email: values.email } });
      form.reset();
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    }
    setLoading(false);
  };
  
  return (
    <Card className="w-full border-0 shadow-lg dark:border dark:border-gray-700 dark:shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Enter your details to get started</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {[
              { 
                name: "name", 
                label: "Full Name", 
                type: "text",
                placeholder: "Enter your full name" 
              },
              { 
                name: "email", 
                label: "Email", 
                type: "email",
                placeholder: "your.email@example.com" 
              },
              { 
                name: "password", 
                label: "Password", 
                type: "password",
                placeholder: "••••••••",
                description: "Must be at least 8 characters with uppercase, lowercase, number and special character" 
              },
              { 
                name: "roll_number", 
                label: "Roll Number", 
                type: "text",
                placeholder: "Enter your roll number" 
              },
              { 
                name: "phone", 
                label: "Phone Number", 
                type: "tel",
                placeholder: "10-digit mobile number" 
              },
              { 
                name: "hostel", 
                label: "Hostel", 
                type: "text",
                placeholder: "Enter your hostel name" 
              },
              { 
                name: "room_number", 
                label: "Room Number", 
                type: "text",
                placeholder: "Enter your room number" 
              }
            ].map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>{field.label}</Label>
                    <FormControl>
                      <Input
                        id={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        {...formField}
                        className="dark:border-gray-600"
                      />
                    </FormControl>
                    {field.description && (
                      <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                Login here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default Register;