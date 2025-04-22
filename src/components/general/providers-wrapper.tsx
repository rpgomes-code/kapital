import { ThemeProvider } from "@/components/theme/theme-provider";
import { ReactNode } from "react";
import { AppSidebar } from "../sidebar/sidebar";
import { Toaster } from "sonner";
import { SidebarProvider } from "../ui/sidebar";

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
        {children}
        <Toaster richColors />
      </SidebarProvider>
    </ThemeProvider>
  );
}
