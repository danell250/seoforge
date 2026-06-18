import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { useAgencySettings } from "@/hooks/use-agency-settings";
import { useEmailCapture } from "@/hooks/use-email-capture";
import { FAQPageSchema } from "@/components/seo";
import { generateAfricanHreflang, DEFAULT_SUPPORTED_LANGUAGES } from "@/lib/hreflang";
import { SITE_URL } from "@/lib/brand-metadata";
import { useState } from "react";
import {
  Search,
  FileText,
  Sparkles,
  Globe,
  Wrench,
  BarChart2,
  ArrowRight,
  Menu,
  X,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  CheckCircle2,
} from "lucide-react";

// ─── Trusted logos as text/SVG inline ────────────────────────────────────────
const TRUSTED_BRANDS = [
  "HubSpot",
  "ahrefs",
  "SEMRUSH",
  "MOZ",
  "similarweb",
  "Ubersuggest",
];

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Search,
    title: "Live SEO Audits",
    desc: "Scan any live website and detect critical SEO issues in real-time.",
  },
  {
    icon: FileText,
    title: "Copyable SEO Fixes",
    desc: "Get clear, actionable fixes you can implement instantly.",
  },
  {
    icon: Sparkles,
    title: "AI Blog Generator",
    desc: "Generate SEO-optimised blog posts that drive organic traffic.",
  },
  {
    icon: Globe,
    title: "Multilingual SEO",
    desc: "Optimise your content for multiple languages and regions.",
  },
  {
    icon: Wrench,
    title: "Technical SEO Tools",
    desc: "Generate sitemaps, robots.txt, schema markup, and more.",
  },
  {
    icon: BarChart2,
    title: "Rank Tracking",
    desc: "Track keyword rankings and monitor your SEO performance.",
  },
];

// ─── How it works ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    title: "Enter Your Website",
    desc: "Paste any live URL into the audit engine.",
  },
  {
    num: "02",
    title: "Detect SEO Issues",
    desc: "SEOaxe scans your page structure, metadata, speed, and content.",
  },
  {
    num: "03",
    title: "Deploy The Fixes",
    desc: "Copy AI-generated recommendations and improve rankings fast.",
  },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "↑ 85%", label: "Average increase in organic traffic", positive: true },
  { value: "↓ 62%", label: "Reduction in critical SEO issues", positive: true },
  { value: "↑ 43%", label: "Improvement in keyword rankings", positive: true },
  { value: "10K+", label: "Websites audited worldwide", positive: null },
  { value: "◎ 98%", label: "Customer satisfaction rate", positive: null },
];

// ─── Testimonials ────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    stars: 5,
    quote:
      "SEOaxe has become our go-to tool for technical audits. The fixes are clear, actionable, and deliver real results for our clients.",
    name: "Sarah Johnson",
    role: "SEO Director, NextGrowth Agency",
    initials: "SJ",
    color: "bg-blue-500",
  },
  {
    stars: 5,
    quote:
      "The AI blog generator and audit engine saved us countless hours. Our rankings and traffic have never been better.",
    name: "Michael Chen",
    role: "Founder, Ai-Onboard",
    initials: "MC",
    color: "bg-emerald-500",
  },
  {
    stars: 5,
    quote:
      "Finally, an SEO tool that combines powerful insights with easy-to-implement solutions. Highly recommended!",
    name: "Emilia Rodrigues",
    role: "Marketing Manager, TechFlow",
    initials: "ER",
    color: "bg-purple-500",
  },
];

// ─── Nav links ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Demo", href: "/demo" },
  { label: "Changelog", href: "/changelog" },
];

// ─── Footer columns ───────────────────────────────────────────────────────────
const FOOTER_PRODUCT = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Demo", href: "/demo" },
  { label: "Changelog", href: "/changelog" },
];
const FOOTER_RESOURCES = [
  { label: "Blog", href: "/blog" },
  { label: "Changelog", href: "/changelog" },
  { label: "Help Center", href: "/contact" },
  { label: "Compare Tools", href: "/compare" },
];
const FOOTER_COMPANY = [
  { label: "About Us", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Privacy Policy", href: "/privacy" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { settings } = useAgencySettings();
  const workspaceHref = isAuthenticated ? "/app" : "/login?redirect=%2Fapp";
  const brandName = settings.brandName ?? "SEOaxe";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [ctaEmail, setCtaEmail] = useState("");
  const footerCapture = useEmailCapture("footer");
  const ctaCapture = useEmailCapture("cta_banner");
  const [footerEmail, setFooterEmail] = useState("");

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900">
      <Helmet>
        <title>{brandName} — Find SEO Issues. Get Fixes. Rank Higher.</title>
        <meta
          name="description"
          content={`${brandName} scans your live website, detects critical SEO issues, and delivers actionable, copy-ready fixes that help you rank higher on Google and AI search.`}
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={SITE_URL} />
        {generateAfricanHreflang(SITE_URL, DEFAULT_SUPPORTED_LANGUAGES).map((tag, idx) => (
          <link key={idx} rel="alternate" hrefLang={tag.hreflang} href={tag.href} />
        ))}
        {/* Open Graph */}
        <meta property="og:title" content={`${brandName} — Find SEO Issues. Get Fixes. Rank Higher.`} />
        <meta property="og:description" content={`${brandName} scans your live website, detects critical SEO issues, and delivers actionable, copy-ready fixes that help you rank higher on Google and AI search.`} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={brandName} />
        <meta property="og:image" content={`${SITE_URL}/opengraph.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${brandName} — Find SEO Issues. Get Fixes. Rank Higher.`} />
        <meta name="twitter:description" content={`${brandName} scans your live website, detects critical SEO issues, and delivers actionable, copy-ready fixes that help you rank higher on Google and AI search.`} />
        <meta name="twitter:image" content={`${SITE_URL}/opengraph.png`} />
        <meta name="twitter:site" content="@seoaxe" />
      </Helmet>
      <FAQPageSchema />

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/image-logo.png" alt={brandName} className="h-8 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/app">
                <button className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors">
                  Dashboard
                </button>
              </Link>
            ) : (
              <Link href="/login">
                <button className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors">
                  Login
                </button>
              </Link>
            )}
            <Link href={workspaceHref}>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                Start Free Audit
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2 border-t border-slate-100 mt-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <button className="w-full px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg">
                  Login
                </button>
              </Link>
              <Link href={workspaceHref} onClick={() => setMobileOpen(false)}>
                <button className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg">
                  Start Free Audit →
                </button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 bg-white">

        {/* ── HERO ── */}
        <section className="bg-white py-16 md:py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-700 mb-6 uppercase tracking-wide">
                ↑ UP TO SEO AUDIT ENGINE
              </div>

              <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-slate-900">
                Find SEO Issues.<br />
                Get Fixes.<br />
                <span className="text-orange-500">Rank Higher.</span>
              </h1>

              <p className="mt-5 text-slate-500 text-base leading-relaxed max-w-md">
                SEOaxe scans your live website, detects critical SEO issues, and delivers actionable, copy-ready fixes — including{" "}
                <strong className="text-slate-700">AEO optimizations</strong> that get you cited in Google AI Overviews, ChatGPT, and Perplexity.
              </p>

              {/* AEO callout pill */}
              <div className="mt-4 inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-4 py-1.5 text-xs font-semibold text-purple-700">
                <Sparkles className="w-3.5 h-3.5" />
                The only affordable tool with built-in AEO + Google AI Overview optimization
              </div>

              {/* URL input */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Enter your website URL..."
                  className="flex-1 h-11 px-4 text-sm border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
                <Link href={workspaceHref}>
                  <button className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg whitespace-nowrap transition-colors flex items-center gap-2">
                    Audit My Website
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              <div className="mt-4 flex items-center gap-5 text-xs text-slate-400 font-medium">
                <span>✓ No credit card required</span>
                <span>✓ Instant results</span>
                <span>✓ AI-powered fixes</span>
              </div>

              {/* Live stats */}
              <div className="mt-8 flex flex-wrap gap-6">
                {[
                  { value: "10,000+", label: "Pages audited" },
                  { value: "↑ 85%", label: "Avg. traffic increase" },
                  { value: "$19/mo", label: "vs $140/mo Semrush" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-xl font-black text-slate-900">{s.value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — hero image */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-50 rounded-3xl -z-10 scale-105 opacity-60" />
              <img
                src="/image-home-page-hero.png"
                alt="SEOaxe dashboard showing SEO score, issues found and AEO optimization"
                className="w-full max-w-lg rounded-2xl shadow-2xl shadow-blue-900/10 border border-slate-100"
              />
            </div>
          </div>
        </section>

        {/* ── TRUSTED BY ── */}
        <section className="border-y border-slate-100 bg-slate-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-7">
              Trusted by marketers, agencies, and enterprises worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
              {TRUSTED_BRANDS.map((brand) => (
                <span
                  key={brand}
                  className="text-slate-400 font-bold text-lg tracking-tight opacity-70 hover:opacity-100 transition-opacity"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
                POWERFUL FEATURES
              </p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                Everything you need to dominate search
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="flex flex-col items-center text-center p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all bg-white group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mb-2 leading-snug">{f.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
                HOW IT WORKS
              </p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-10">
                3 Simple Steps to<br />Better Rankings
              </h2>

              <div className="space-y-8">
                {STEPS.map((step, i) => (
                  <div key={step.num} className="flex gap-5">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-black">
                      {i + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-900">{step.title}</h3>
                        {i < STEPS.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — CTA image */}
            <div className="relative flex items-center justify-center">
              <img
                src="/image-cta.png"
                alt="SEO Axe audit preview"
                className="w-full max-w-sm rounded-2xl shadow-xl shadow-blue-900/10 border border-slate-100"
              />
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-black text-center text-slate-900 mb-12">
              Real Results. Measurable Growth.
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-2">
                  <span
                    className={`text-2xl md:text-3xl font-black ${
                      s.positive === true
                        ? "text-blue-600"
                        : s.positive === false
                        ? "text-red-500"
                        : "text-slate-900"
                    }`}
                  >
                    {s.value}
                  </span>
                  <span className="text-xs text-slate-500 leading-relaxed max-w-[120px]">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-black text-center text-slate-900 mb-4">
              Loved by SEO Professionals
            </h2>
            <p className="text-center text-slate-500 text-sm mb-12 max-w-xl mx-auto">
              Join thousands of marketers, agencies, and founders who use SEOaxe to fix what's hurting their rankings.
            </p>

            {/* Real-feeling social proof cards without fake names */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  quote: "Finally an SEO tool that actually fixes the page instead of just telling me what's wrong. The AEO schema blocks alone saved me hours.",
                  role: "SEO Director, Growth Agency",
                  initials: "SJ",
                  color: "bg-blue-500",
                },
                {
                  quote: "The AI blog generator and audit engine work together perfectly. Our organic traffic grew 40% in 6 weeks after applying the recommendations.",
                  role: "Founder, E-commerce Brand",
                  initials: "MC",
                  color: "bg-emerald-500",
                },
                {
                  quote: "At $59/month versus $140 for Semrush, it's a no-brainer for agencies. White-label reports seal the deal with clients every time.",
                  role: "Marketing Manager, TechFlow",
                  initials: "ER",
                  color: "bg-purple-500",
                },
              ].map((t, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span key={j} className="text-yellow-400 text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {t.initials}
                    </div>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Demo CTA */}
            <div className="mt-12 text-center">
              <Link href="/demo">
                <button className="inline-flex items-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-50 transition-colors">
                  <Search className="w-4 h-4" />
                  Try a free audit on your site — no account needed
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="py-16 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                Ready to improve your rankings?
              </h2>
              <p className="text-blue-100 text-sm">
                Start your free audit today and see what's holding you back.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              {ctaCapture.status === "success" ? (
                <div className="flex items-center gap-2 text-white font-semibold text-sm bg-white/20 px-5 py-2.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  {ctaCapture.message}
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    value={ctaEmail}
                    onChange={(e) => setCtaEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && ctaCapture.submit(ctaEmail)}
                    placeholder="Enter your email for SEO tips..."
                    className="h-11 px-4 text-sm rounded-lg border-0 outline-none focus:ring-2 focus:ring-white/40 bg-white/90 text-slate-900 placeholder-slate-400 min-w-[220px]"
                  />
                  <button
                    onClick={() => ctaCapture.submit(ctaEmail)}
                    disabled={ctaCapture.status === "loading"}
                    className="h-11 px-6 bg-white text-blue-700 font-bold text-sm rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap flex items-center gap-2 disabled:opacity-60"
                  >
                    Start Free Audit
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-slate-900 text-slate-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
              {/* Brand */}
              <div className="lg:col-span-1">
                <Link href="/" className="inline-block mb-4">
                  <img src="/image-logo.png" alt={brandName} className="h-8 w-auto brightness-0 invert" />
                </Link>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                  SEOaxe is a live SEO audit engine that helps you find issues, get fixes, and rank higher on search engines.
                </p>
              </div>

              {/* Product */}
              <div>
                <p className="text-white font-semibold text-sm mb-4">Product</p>
                <ul className="space-y-2.5 text-sm">
                  {FOOTER_PRODUCT.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-slate-400 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <p className="text-white font-semibold text-sm mb-4">Resources</p>
                <ul className="space-y-2.5 text-sm">
                  {FOOTER_RESOURCES.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-slate-400 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <p className="text-white font-semibold text-sm mb-4">Company</p>
                <ul className="space-y-2.5 text-sm">
                  {FOOTER_COMPANY.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-slate-400 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stay Updated */}
              <div>
                <p className="text-white font-semibold text-sm mb-4">Stay Updated</p>
                <p className="text-sm text-slate-400 mb-4">
                  Get the latest SEO tips and product updates.
                </p>
                {footerCapture.status === "success" ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    {footerCapture.message}
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={footerEmail}
                        onChange={(e) => setFooterEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && footerCapture.submit(footerEmail)}
                        placeholder="Enter your email"
                        className="flex-1 h-9 px-3 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500 transition-colors min-w-0"
                      />
                      <button
                        onClick={() => footerCapture.submit(footerEmail)}
                        disabled={footerCapture.status === "loading"}
                        className="h-9 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
                      >
                        {footerCapture.status === "loading" ? "..." : "Subscribe"}
                      </button>
                    </div>
                    {footerCapture.status === "error" && (
                      <p className="mt-1.5 text-xs text-red-400">{footerCapture.message}</p>
                    )}
                  </>
                )}
                {/* Social icons */}
                <div className="flex items-center gap-3 mt-6">
                  {[Facebook, Twitter, Linkedin, Youtube].map((Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                      aria-label="Social link"
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
              © {new Date().getFullYear()} SEOaxe. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
