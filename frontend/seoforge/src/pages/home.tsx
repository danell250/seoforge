import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { FAQPageSchema } from "@/components/seo";
import { generateAfricanHreflang, DEFAULT_SUPPORTED_LANGUAGES } from "@/lib/hreflang";
import { SITE_URL } from "@/lib/brand-metadata";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const workspaceHref = isAuthenticated ? "/app" : "/login?redirect=%2Fapp";

  const features = [
    {
      title: 'Live SEO Audits',
      desc: 'Scan live websites and instantly detect ranking issues.',
    },
    {
      title: 'Copyable SEO Fixes',
      desc: 'Get actionable fixes you can deploy immediately.',
    },
    {
      title: 'AI Blog Generator',
      desc: 'Generate SEO-ready content around your target keywords.',
    },
    {
      title: 'Technical SEO Tools',
      desc: 'Create sitemaps, robots.txt, schema markup, and more.',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Enter Your Website',
      desc: 'Paste any live URL into the audit engine.',
    },
    {
      step: '02',
      title: 'Detect SEO Issues',
      desc: 'SEOaxe scans your page structure, metadata, speed, and content.',
    },
    {
      step: '03',
      title: 'Deploy The Fixes',
      desc: 'Copy AI-generated recommendations and improve rankings fast.',
    },
  ];

  const dashboardIssues = [
    'Missing H1 heading detected',
    'Meta description exceeds optimal length',
    'No FAQ schema markup found',
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>SEOaxe — Live SEO Audit and AEO Guidance</title>
        <meta name="description" content="SEOaxe provides live SEO audits and answer engine optimization (AEO) guidance. Optimize your website for Google search and AI overviews." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={SITE_URL} />
        {generateAfricanHreflang(SITE_URL, DEFAULT_SUPPORTED_LANGUAGES).map((tag, idx) => (
          <link key={idx} rel="alternate" hrefLang={tag.hreflang} href={tag.href} />
        ))}
        <meta property="og:title" content="SEOaxe — Live SEO Audit and AEO Guidance" />
        <meta property="og:description" content="SEOaxe provides live SEO audits and answer engine optimization (AEO) guidance. Optimize your website for Google search and AI overviews." />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/opengraph.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="twitter:title" content="SEOaxe — Live SEO Audit and AEO Guidance" />
        <meta property="twitter:description" content="SEOaxe provides live SEO audits and answer engine optimization (AEO) guidance. Optimize your website for Google search and AI overviews." />
        <meta property="twitter:url" content={SITE_URL} />
        <meta property="twitter:image" content={`${SITE_URL}/opengraph.jpg`} />
      </Helmet>
      <FAQPageSchema />

      <main className="min-h-screen bg-white text-slate-900 overflow-hidden">
        {/* NAVBAR */}
        <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-lg">
                S
              </div>
              <div>
                <div className="text-xl font-black tracking-tight">SEOaxe</div>
                <div className="text-xs text-slate-500">AI SEO Optimization Engine</div>
              </div>
            </div>

            <nav className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-black">
                Features
              </a>
              <a href="#how" className="text-sm font-medium text-slate-600 hover:text-black">
                How It Works
              </a>
              <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-black">
                FAQ
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <button className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                  Login
                </button>
              </Link>
              <Link href={workspaceHref}>
                <button className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700">
                  Start Free Audit
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="relative isolate">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_35%)]" />

          <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-2 lg:items-center lg:py-32">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                Live AI SEO Audit Engine
              </div>

              <h1 className="max-w-2xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
                Your website already tells Google what’s wrong.
                <span className="block bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                  SEOaxe shows you how to fix it.
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-lg leading-8 text-slate-600 md:text-xl">
                Scan any live website and get instant SEO issue detection, copyable fixes, AI blog generation, multilingual optimization, and technical SEO guidance.
              </p>

              {/* INTERACTIVE HERO INPUT */}
              <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/60">
                <div className="flex flex-col gap-4 md:flex-row">
                  <input
                    type="text"
                    placeholder="Enter your website URL..."
                    className="h-14 flex-1 rounded-2xl border border-slate-200 px-5 text-base outline-none transition focus:border-blue-500"
                  />

                  <Link href={workspaceHref}>
                    <button className="h-14 rounded-2xl bg-blue-600 px-8 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700">
                      Analyze Free
                    </button>
                  </Link>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-6 text-sm text-slate-500">
                  <div>✓ No file uploads</div>
                  <div>✓ Beginner friendly</div>
                  <div>✓ Deployable fixes</div>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-8 text-sm font-semibold text-slate-500">
                <div>
                  <span className="text-2xl font-black text-slate-900">50K+</span>
                  <div>Pages Audited</div>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900">+47</span>
                  <div>Average SEO Score Increase</div>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900">Instant</span>
                  <div>Issue Detection</div>
                </div>
              </div>
            </div>

            {/* DASHBOARD MOCKUP */}
            <div className="relative">
              <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="absolute -bottom-10 right-0 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />

              <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
                <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold">SEOaxe Audit</div>
                      <div className="text-sm text-slate-500">seoaxe.site</div>
                    </div>

                    <div className="rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                      SEO Score 89/100
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 p-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                      <div className="text-sm font-semibold text-red-500">Issues Found</div>
                      <div className="mt-2 text-4xl font-black text-red-600">12</div>
                    </div>

                    <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-5">
                      <div className="text-sm font-semibold text-yellow-600">Warnings</div>
                      <div className="mt-2 text-4xl font-black text-yellow-600">7</div>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                      <div className="text-sm font-semibold text-emerald-600">Passed Checks</div>
                      <div className="mt-2 text-4xl font-black text-emerald-600">48</div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="text-xl font-black">Suggested Fixes</h3>
                      <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        AI Generated
                      </div>
                    </div>

                    <div className="space-y-4">
                      {dashboardIssues.map((issue) => (
                        <div
                          key={issue}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-red-500" />
                            <span className="font-medium text-slate-700">{issue}</span>
                          </div>

                          <Link href={workspaceHref}>
                            <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
                              View Fix
                            </button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="border-t border-slate-100 bg-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl">
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                Features
              </div>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Built to fix SEO problems — not just report them.
              </h2>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-[28px] border border-slate-200 bg-white p-8 transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-700">
                    ✦
                  </div>

                  <h3 className="mt-6 text-2xl font-black tracking-tight">
                    {feature.title}
                  </h3>

                  <p className="mt-4 leading-7 text-slate-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                How It Works
              </div>

              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                SEO simplified into 3 steps.
              </h2>
            </div>

            <div className="mt-20 grid gap-8 md:grid-cols-3">
              {howItWorks.map((item) => (
                <div key={item.step} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="text-6xl font-black text-blue-100">{item.step}</div>
                  <h3 className="mt-6 text-2xl font-black">{item.title}</h3>
                  <p className="mt-4 leading-7 text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[40px] bg-gradient-to-r from-slate-950 to-blue-950 px-10 py-20 text-white shadow-2xl">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-xl">
                Start Improving Your Rankings Today
              </div>

              <h2 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
                Stop guessing what’s hurting your SEO.
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-300">
                SEOaxe gives you instant SEO analysis, AI-generated fixes, and optimization tools built for modern websites.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link href={workspaceHref}>
                  <button className="rounded-2xl bg-white px-8 py-4 text-base font-bold text-slate-900 transition hover:bg-slate-100">
                    Run Free Audit
                  </button>
                </Link>

                <Link href="/pricing">
                  <button className="rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-xl transition hover:bg-white/20">
                    View Demo
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-100 py-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <div>© 2026 SEOaxe. All rights reserved.</div>

            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-slate-900">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-slate-900">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-slate-900">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
