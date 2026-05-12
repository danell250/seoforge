import { Link } from "wouter";
import { useAgencySettings } from "@/hooks/use-agency-settings";
import { useAuth } from "@/hooks/use-auth";
import { SEOaxeLogo } from "./logo";

export function Footer() {
  const { settings } = useAgencySettings();
  const { isAuthenticated } = useAuth();

  const brandName = settings?.brandName ?? "SEOaxe";
  const logo = settings?.logoUrl ?? undefined;
  const usingDefaultBrand = !logo;

  const exploreLinks = [
    { href: "/#features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/compare", label: "SEOaxe vs Competitors" },
    { href: "/blog", label: "Blog" },
    { href: "/media-kit", label: "Media Kit" },
    { href: "/login", label: "Login" },
  ];

  const seoLinks = [
    { href: "/audit", label: "Free SEO Audit" },
    { href: "/technical-seo-audit", label: "Technical SEO Audit" },
    { href: "/aeo-optimizer", label: "AEO Optimizer" },
    { href: "/schema-markup-generator", label: "Schema Markup Generator" },
    { href: "/local-seo-south-africa", label: "South Africa Local SEO" },
  ];

  const legalLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/refund-policy", label: "Refund Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/contact", label: "Contact Us" },
  ];

  const workspaceLinks = [
    { href: "/app#site-crawler", label: "Live Site Audit" },
    ...(isAuthenticated ? [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/settings", label: "Settings" },
    ] : []),
  ];

  return (
    <footer className="mt-auto bg-[#0F172A] border-t border-slate-800">
      <div className="container px-4 py-16 sm:px-6 md:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1 pl-1 sm:pl-2">
            {/* Logo matching navbar style */}
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              {settings?.logoUrl ? (
                <img src={logo} alt={brandName} className="h-7 w-auto" />
              ) : usingDefaultBrand ? (
                <SEOaxeLogo />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">{brandName.slice(0, 1)}</span>
                </div>
              )}
              {!usingDefaultBrand && (
                <span className="font-semibold tracking-tight text-white text-lg">{brandName}</span>
              )}
            </Link>
            
            {/* Tagline */}
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Built for modern SEO teams. Powered by AI.
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

          {/* SEO Pages Column */}
          <div>
            <p className="text-sm font-semibold text-white mb-4 tracking-wide">SEO Pages</p>
            <ul className="space-y-3 text-sm">
              {seoLinks.map((item) => (
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
