import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const VerifyEmail = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  const form = useForm({
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await api.post("/user/verify-email", { email, otp: data.otp });
      toast({
        title: "Email Verified",
        description: "You can now login.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error?.response?.data?.message || "Invalid or expired OTP",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border dark:border-gray-700 shadow-md">
      <CardHeader>
        <CardTitle>Email Verification</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      {...field}
                      value={field.value || ""}
                      onChange={field.onChange}
                    >
                      <InputOTPGroup>
                        {[...Array(6)].map((_, idx) => (
                          <InputOTPSlot key={idx} index={idx} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Verify
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default VerifyEmail;
