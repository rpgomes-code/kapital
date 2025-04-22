"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Apple, Google, Windows } from "iconsax-reactjs";
import { FaGithub } from "react-icons/fa";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div
      className={cn("flex flex-col gap-6 max-w-md mx-auto", className)}
      {...props}
    >
      <Card className="overflow-hidden border-2 pb-0 px-0">
        <CardContent className="p-6 md:p-8 pb-2 md:pb-4">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
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
                  Welcome back
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Sign in to access your Kapital dashboard
                </p>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:text-primary/90 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <Input
                      id="password"
                      type={isPasswordVisible ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      aria-label={
                        isPasswordVisible ? "Hide password" : "Show password"
                      }
                    >
                      {isPasswordVisible ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: <Apple size="20" variant="Bold" />, label: "Apple" },
                  {
                    icon: <Google size="20" variant="Bold" />,
                    label: "Google",
                  },
                  {
                    icon: <Windows size="20" variant="Bold" />,
                    label: "Microsoft",
                  },
                  { icon: <FaGithub size="20" />, label: "GitHub" },
                ].map((provider) => (
                  <Button
                    key={provider.label}
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    className="h-11 hover:bg-muted/50 transition-colors cursor-pointer disabled:cursor-none"
                    onClick={() =>
                      console.log(`Sign in with ${provider.label}`)
                    }
                    aria-label={`Sign in with ${provider.label}`}
                  >
                    {provider.icon}
                    <span className="sr-only">
                      Sign in with {provider.label}
                    </span>
                  </Button>
                ))}
              </div>

              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-primary font-medium hover:underline cursor-pointer"
                >
                  Create account
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/30 p-4 flex items-center gap-2 border-t">
          <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Your financial data is protected with enterprise-grade encryption
            and security protocols.
          </p>
        </CardFooter>
      </Card>

      <div className="flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
        <Link
          href="/terms-of-service"
          className="hover:text-primary transition-colors cursor-pointer"
        >
          Terms
        </Link>
        <span>•</span>
        <Link
          href="/privacy-policy"
          className="hover:text-primary transition-colors cursor-pointer"
        >
          Privacy
        </Link>
        <span>•</span>
        <Link
          href="/help"
          className="hover:text-primary transition-colors cursor-pointer"
        >
          Help Center
        </Link>
      </div>
    </div>
  );
}
