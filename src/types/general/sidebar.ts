import { LucideIcon } from "lucide-react";

export type User = {
  name: string;
  username: string;
  role: string;
  email: string;
  avatar: string;
};

export type SidebarSubItem = {
  title: string;
  url: string;
};

export type SidebarItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: SidebarSubItem[];
};
