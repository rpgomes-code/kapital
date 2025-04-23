import { ThemeProvider } from "@/components/theme/theme-provider";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import { SidebarProvider } from "../ui/sidebar";
import { TRPCProvider } from "@/app/_trpc/Provider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
      enableColorScheme
      themes={["light", "dark"]}
    >
      <SidebarProvider>
        <TRPCProvider>
          {children}
          <Toaster richColors />
        </TRPCProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
