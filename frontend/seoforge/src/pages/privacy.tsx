import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 py-12 px-4">
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-muted-foreground mb-6">
              Last updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                SEOaxe ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered SEO optimization platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              <h3 className="text-lg font-medium mb-2">2.1 Personal Information</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1 mb-4">
                <li>Email address</li>
                <li>Account credentials</li>
                <li>Billing information (for paid plans)</li>
                <li>Company name (optional)</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-2">2.2 Usage Data</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1 mb-4">
                <li>HTML content you upload for optimization</li>
                <li>Optimization history and preferences</li>
                <li>Website URLs you crawl or analyze</li>
                <li>Log data and analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Provide and maintain our SEO optimization services</li>
                <li>Process and optimize your HTML content using AI</li>
                <li>Generate reports, sitemaps, and schema markup</li>
                <li>Communicate with you about your account and services</li>
                <li>Improve our platform and develop new features</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your data. However, no method of transmission over the internet is 100% secure. We use industry-standard encryption and secure servers located in secure data centers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations. You can request deletion of your account and associated data at any time by contacting us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Under South African POPIA and applicable data protection laws, you have the right to:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your personal information</li>
                <li>Object to processing of your data</li>
                <li>Request data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">7. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use third-party services including Google Gemini for AI processing, hosting providers, and analytics tools. These services may collect data according to their own privacy policies. We do not sell your personal information to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">8. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience, analyze usage, and for authentication. You can manage cookie preferences through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="text-muted-foreground mt-2">
                Email: privacy@seoforge.app
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
