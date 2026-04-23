import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAgencySettings } from "@/hooks/use-agency-settings";
import logoUrl from "@/assets/logo.png";

export function Navbar() {
  const { settings } = useAgencySettings();
  const accent = { color: settings.primaryColor };
  const usingDefaultBrand = settings.brandName === "SEOForge" && !settings.logoUrl;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.brandName} className="h-8 w-auto" />
          ) : usingDefaultBrand ? (
            <img src={logoUrl} alt="SEOForge" className="h-8 w-8" />
          ) : null}
          <span className="font-bold text-xl tracking-tight" style={accent}>{settings.brandName}</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-muted-foreground">
          <Link href="/#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          <Link href="/settings" className="hover:text-foreground transition-colors">Settings</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Login
          </Link>
          <Link href="/app" className="hidden sm:inline-flex">
            <Button size="sm" style={{ backgroundColor: settings.primaryColor }}>Try It Free</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
