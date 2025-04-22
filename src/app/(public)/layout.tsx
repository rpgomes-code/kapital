import { AppSidebar } from "@/components/sidebar/sidebar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppSidebar />
      <main className="h-screen w-full">{children}</main>
    </>
  );
}
