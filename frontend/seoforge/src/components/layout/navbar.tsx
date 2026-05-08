import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAgencySettings } from "@/hooks/use-agency-settings";
import { useAuth } from "@/hooks/use-auth";
import { BarChart3, Settings2, Sparkles } from "lucide-react";
import logoUrl from "@/assets/logo.png";

export function Navbar() {
  const { settings } = useAgencySettings();
  const { user, isAuthenticated, logout, isLogoutPending } = useAuth();
  const [location] = useLocation();
  const brandName = settings?.brandName ?? "SEOaxe";
  const primaryColor = settings?.primaryColor ?? "#2563eb";
  const logo = settings?.logoUrl ?? undefined;
  const usingDefaultBrand = !logo;

  const navItems = isAuthenticated
    ? [
        { href: "/app", label: "Workspace" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/settings", label: "Settings" },
      ]
    : [
        { href: "/pricing", label: "Pricing" },
        { href: "/compare", label: "Compare" },
      ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 pl-1 sm:pl-2">
            {settings.logoUrl ? (
              <img src={logo} alt={brandName} className="h-7 w-auto" />
            ) : usingDefaultBrand ? (
              <img src={logoUrl} alt={brandName} className="h-7 w-7" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">{brandName.slice(0, 1)}</span>
              </div>
            )}
            <span className="font-semibold tracking-tight">{brandName}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      active ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 pl-4 border-l">
              {isAuthenticated ? (
                <>
                  <span className="text-xs text-muted-foreground hidden lg:block">
                    {user?.email}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => void logout()} disabled={isLogoutPending}>
                    {isLogoutPending ? "..." : "Logout"}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" style={{ backgroundColor: primaryColor }}>
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="flex items-center gap-2 md:hidden">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    active ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link href="/signup">
              <Button size="sm" className="ml-2" style={{ backgroundColor: primaryColor }}>
                Start
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
