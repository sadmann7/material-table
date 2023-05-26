"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    title: "Server Controlled",
    href: "/",
  },
  {
    title: "Client Controlled",
    href: "/client-controlled",
  },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full bg-background">
      <div className="container flex h-16 items-center">
        <nav className="flex items-center space-x-6 text-sm font-semibold">
          {navItems.map(
            (navItem, i) =>
              navItem.href && (
                <Link
                  key={i}
                  href={navItem.href}
                  className={cn(
                    "flex items-center text-muted-foreground transition-colors hover:text-foreground/80",
                    pathname === navItem.href && "text-foreground"
                  )}
                >
                  {navItem.title}
                </Link>
              )
          )}
        </nav>
      </div>
    </header>
  );
}
