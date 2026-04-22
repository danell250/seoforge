import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl tracking-tight text-primary">SEOForge</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-muted-foreground">
          <Link href="/#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Login
          </Link>
          <Link href="/app" className="hidden sm:inline-flex">
            <Button size="sm">Try It Free</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
