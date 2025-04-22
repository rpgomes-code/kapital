"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Apple, Google, Windows } from "iconsax-reactjs";
import { FaGithub } from "react-icons/fa";
import { Eye, EyeOff, ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormValues, registerSchema } from "@/lib/validations/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // Form visibility states
  const [step, setStep] = useState(1);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
    mode: "onChange",
  });

  // Check if the current step is valid
  const isStepValid = (stepNumber: number) => {
    const {
      username,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      agreeToTerms,
    } = form.getValues();
    const { errors } = form.formState;

    switch (stepNumber) {
      case 1:
        // Check if basic info fields are valid
        return (
          username !== "" &&
          firstName !== "" &&
          lastName !== "" &&
          email !== "" &&
          !errors.username &&
          !errors.firstName &&
          !errors.lastName &&
          !errors.email
        );
      case 2:
        // Check if password fields are valid and terms are agreed
        return (
          password !== "" &&
          confirmPassword !== "" &&
          agreeToTerms === true &&
          !errors.password &&
          !errors.confirmPassword &&
          !errors.agreeToTerms
        );
      default:
        return true;
    }
  };

  // Move to next step
  const handleNextStep = () => {
    if (step < 3 && isStepValid(step)) {
      setStep(step + 1);
    } else {
      // Trigger validation to show errors
      form.trigger();
    }
  };

  // Move to previous step
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Form submission
  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);

    try {
      // Here you would typically connect to your registration API
      console.log("Registration form data:", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success toast
      toast.success("Account created successfully!");

      // Redirect to login page or dashboard
      // router.push('/login');
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className={cn("flex flex-col gap-6 max-w-md mx-auto", className)}
      {...props}
    >
      <Card className="overflow-hidden border-2 pb-0 px-0">
        <CardContent className="p-6 md:p-8 pb-2 md:pb-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                {/* Form header - always visible */}
                <div className="flex flex-col items-center text-center">
                  <div className="flex justify-center">
                    <Link
                      href="/"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div className="flex aspect-square size-16 items-center justify-center rounded-lg bg-white text-primary-foreground shadow-md hover:shadow-lg transition-shadow">
                        <Image
                          src="/kapital/kapital.png"
                          alt="Kapital Logo"
                          width={60}
                          height={60}
                        />
                      </div>
                    </Link>
                  </div>
                  <h1 className="text-2xl font-bold text-primary mt-4">
                    Create your account
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Join Kapital to start managing your finances
                  </p>
                </div>

                {/* Step indicator */}
                <div className="flex justify-center space-x-2 mb-2">
                  {[1, 2, 3].map((stepNumber) => (
                    <div
                      key={stepNumber}
                      className={`h-2 rounded-full ${
                        stepNumber === step
                          ? "w-8 bg-primary"
                          : stepNumber < step
                          ? "w-8 bg-primary/60"
                          : "w-8 bg-muted"
                      }`}
                    />
                  ))}
                </div>

                {/* Step 1: Basic Information */}
                {step === 1 && (
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="yourusername"
                              autoComplete="username"
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First name</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last name</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email address</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="you@example.com"
                              autoComplete="email"
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Password Setup */}
                {step === 2 && (
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={isPasswordVisible ? "text" : "password"}
                                autoComplete="new-password"
                                className="h-11 pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  setIsPasswordVisible(!isPasswordVisible)
                                }
                                aria-label={
                                  isPasswordVisible
                                    ? "Hide password"
                                    : "Show password"
                                }
                              >
                                {isPasswordVisible ? (
                                  <EyeOff size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-1">
                            Password must be at least 8 characters with
                            uppercase, lowercase, number and special character
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={
                                  isConfirmPasswordVisible ? "text" : "password"
                                }
                                autoComplete="new-password"
                                className="h-11 pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  setIsConfirmPasswordVisible(
                                    !isConfirmPasswordVisible
                                  )
                                }
                                aria-label={
                                  isConfirmPasswordVisible
                                    ? "Hide password"
                                    : "Show password"
                                }
                              >
                                {isConfirmPasswordVisible ? (
                                  <EyeOff size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0 pt-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              I agree to the{" "}
                              <Link
                                href="/terms"
                                className="text-primary hover:underline"
                              >
                                Terms of Service
                              </Link>{" "}
                              and{" "}
                              <Link
                                href="/privacy"
                                className="text-primary hover:underline"
                              >
                                Privacy Policy
                              </Link>
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 3: Social Connections */}
                {step === 3 && (
                  <div className="grid gap-6">
                    <div className="text-center">
                      <h2 className="text-lg font-medium">
                        Connect your accounts
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Optional: Sign up faster with your existing accounts
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {[
                        {
                          icon: <Apple size="20" variant="Bold" />,
                          label: "Apple",
                          hoverBorder:
                            "hover:border-black dark:hover:border-white",
                        },
                        {
                          icon: <Google size="20" variant="Bold" />,
                          label: "Google",
                          hoverBorder:
                            "hover:border-[#4285F4] dark:hover:border-[#4285F4]",
                        },
                        {
                          icon: <Windows size="20" variant="Bold" />,
                          label: "Microsoft",
                          hoverBorder:
                            "hover:border-green-700 dark:hover:border-green-700",
                        },
                        {
                          icon: <FaGithub size="20" />,
                          label: "GitHub",
                          hoverBorder:
                            "hover:border-[#6e5494] dark:hover:border-[#6e5494]",
                        },
                      ].map((provider) => (
                        <Button
                          key={provider.label}
                          type="button"
                          variant="outline"
                          disabled={isLoading}
                          className={`h-11 border hover:border-2 transition-colors flex items-center justify-center gap-2 ${provider.hoverBorder} cursor-pointer disabled:cursor-not-allowed`}
                          aria-label={`Sign up with ${provider.label}`}
                          onClick={() =>
                            console.log(`Sign up with ${provider.label}`)
                          }
                        >
                          {provider.icon}
                          <span>Continue with {provider.label}</span>
                        </Button>
                      ))}
                    </div>

                    <div className="text-center py-2">
                      <p className="text-sm text-muted-foreground">
                        You can also connect these accounts later
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex justify-between gap-4 mt-2">
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handlePrevStep}
                      disabled={isLoading}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  ) : (
                    <div className="flex-1"></div>
                  )}

                  {step < 3 ? (
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={handleNextStep}
                      disabled={isLoading || !isStepValid(step)}
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                  )}
                </div>

                {/* Sign in link */}
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-primary font-medium hover:underline cursor-pointer"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="bg-muted/30 p-4 flex items-center gap-2 border-t">
          <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Your financial data is protected with enterprise-grade encryption
            and security protocols.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
