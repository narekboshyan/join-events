"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignInInput, signInSchema } from "@/lib/validations/auth";

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const watchedFields = watch();

  const onSubmit = async (data: SignInInput) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        redirectTo: "/dashboard",
      });

      if (result?.error) {
        console.log(result.error);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Helper to determine validation icon visibility
  const showValidationIcon = (fieldName: keyof SignInInput) =>
    watchedFields[fieldName] && !errors[fieldName];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-card text-card-foreground rounded-2xl shadow-xl border border-border p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="email"
                      id="email"
                      className={`pl-10 ${
                        errors.email
                          ? "border-destructive focus-visible:ring-destructive"
                          : showValidationIcon("email")
                          ? "border-green-500 focus-visible:ring-green-500"
                          : ""
                      }`}
                      placeholder="Enter your email"
                    />
                  )}
                />
                {showValidationIcon("email") && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="text-sm text-destructive flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className={`pl-10 ${
                        errors.password
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      placeholder="Enter your password"
                    />
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Controller
                  name="rememberMe"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Checkbox
                        id="rememberMe"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-4 w-4"
                      />
                      <Label
                        htmlFor="rememberMe"
                        className="ml-2 text-sm text-muted-foreground"
                      >
                        Remember me
                      </Label>
                    </>
                  )}
                />
              </div>
              <Button
                variant="link"
                className="p-0 h-auto text-primary hover:text-primary-foreground font-medium"
              >
                Forgot password?
              </Button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-primary-foreground transition-all duration-200
                bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transform hover:scale-[1.02] active:scale-[0.98]
                ${
                  !isValid || isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto text-primary hover:text-primary-foreground underline"
          >
            Sign up
          </Button>
        </p>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-secondary border border-border rounded-xl">
          <p className="text-sm text-secondary-foreground font-medium mb-2">
            Demo Credentials:
          </p>
          <p className="text-xs text-muted-foreground">
            Email: user@example.com
          </p>
          <p className="text-xs text-muted-foreground">Password: password123</p>
        </div>
      </div>
    </div>
  );
}
