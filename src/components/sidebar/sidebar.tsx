"use client";

import { NavSecondary } from "@/components/sidebar/secondary";
import { NavUser } from "@/components/sidebar/user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  backofficeSidebarItems,
  holderSidebarItems,
  stonksSidebarItems,
  secondarySidebarItems,
  systemUser,
} from "@/constants/general/sidebar";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { SidebarSection } from "./sidebar-section";
import { SidebarSearch } from "./sidebar-search";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-sidebar-primary-foreground">
                  <Image
                    src={"/kapital/kapital.png"}
                    alt="Logo"
                    width={200}
                    height={200}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Kapital</span>
                  <span className="truncate text-xs">Wealth Companion</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSearch />
      </SidebarHeader>
      <SidebarContent>
        {/* Holder navigation */}
        <SidebarSection name={"Holder"} items={holderSidebarItems} />
        {/* Stonks navigation */}
        <SidebarSection name={"Stonks"} items={stonksSidebarItems} />
        {/* Backoffice navigation */}
        <SidebarSection name={"Backoffice"} items={backofficeSidebarItems} />
        {/* Secondary navigation items, positioned at the bottom */}
        <NavSecondary items={secondarySidebarItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={systemUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
