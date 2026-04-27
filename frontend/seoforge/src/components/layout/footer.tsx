import { Link } from "wouter";
import { useAgencySettings } from "@/hooks/use-agency-settings";
import { useAuth } from "@/hooks/use-auth";
import { BarChart3, Sparkles, Settings2, Mail, Shield, FileText } from "lucide-react";
import logoUrl from "@/assets/logo.png";

export function Footer() {
  const { settings } = useAgencySettings();
  const { isAuthenticated } = useAuth();

  const brandName = settings?.brandName ?? "SEODomination";
  const logo = settings?.logoUrl ?? undefined;
  const usingDefaultBrand = brandName === "SEODomination" && !logo;

  const exploreLinks = [
    { href: "/#features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/compare", label: "SEODomination vs Competitors" },
    { href: "/blog", label: "Blog" },
    { href: "/login", label: "Login" },
  ];

  const legalLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/contact", label: "Contact Us" },
  ];

  const workspaceLinks = [
    { href: "/app", label: "Optimizer" },
    ...(isAuthenticated ? [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/settings", label: "Settings" },
    ] : []),
  ];

  return (
    <footer className="mt-auto bg-[#0F172A] border-t border-slate-800">
      <div className="container py-16 md:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            {/* Logo matching navbar style */}
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              {settings?.logoUrl ? (
                <img src={logo} alt={brandName} className="h-7 w-auto" />
              ) : usingDefaultBrand ? (
                <img src={logoUrl} alt="SEODomination" className="h-7 w-7" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">{brandName.slice(0, 1)}</span>
                </div>
              )}
              <span className="font-semibold tracking-tight text-white text-lg">{brandName}</span>
            </Link>
            
            {/* Tagline */}
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Built for African businesses. Powered by AI.
            </p>
          </div>

          {/* Explore Column */}
          <div>
            <p className="text-sm font-semibold text-white mb-4 tracking-wide">Explore</p>
            <ul className="space-y-3 text-sm">
              {exploreLinks.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Workspace Column */}
          <div>
            <p className="text-sm font-semibold text-white mb-4 tracking-wide">Workspace</p>
            <ul className="space-y-3 text-sm">
              {workspaceLinks.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <p className="text-sm font-semibold text-white mb-4 tracking-wide">Legal</p>
            <ul className="space-y-3 text-sm">
              {legalLinks.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider and Copyright */}
        <div className="mt-16 pt-8 border-t border-slate-800">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
