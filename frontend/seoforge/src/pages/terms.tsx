import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 py-12 px-4">
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Terms of Service</h1>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-muted-foreground mb-6">
              Last updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using SEOaxe ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                SEOaxe is an AI-powered platform that provides SEO (Search Engine Optimization) and AEO (Answer Engine Optimization) tools, including HTML optimization, meta tag generation, schema markup creation, sitemap generation, and website analysis services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">3. Accounts and Registration</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Distribute malware or malicious content</li>
                <li>Scrape or crawl websites without permission</li>
                <li>Upload content that is illegal, harmful, or offensive</li>
                <li>Attempt to gain unauthorized access to systems</li>
                <li>Interfere with other users' access to the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">5. Content and Intellectual Property</h2>
              <h3 className="text-lg font-medium mb-2">5.1 Your Content</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You retain ownership of any content you upload to the Service. By uploading content, you grant us a license to use, process, and store it solely to provide the Service.
              </p>
              
              <h3 className="text-lg font-medium mb-2">5.2 Our Intellectual Property</h3>
              <p className="text-muted-foreground leading-relaxed">
                The Service and its original content, features, and functionality are owned by SEOaxe and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">6. Payment and Billing</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Some features of the Service require payment. You agree to:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Pay all fees associated with your subscription plan</li>
                <li>Provide accurate billing information</li>
                <li>Accept that fees are non-refundable except as required by law</li>
                <li>Accept that we may change pricing with 30 days notice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">7. Termination</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Breach of these Terms</li>
                <li>Engaging in prohibited activities</li>
                <li>Fraudulent or abusive behavior</li>
                <li>Non-payment of fees</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Upon termination, your right to use the Service will immediately cease.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">8. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, regarding the Service's reliability, accuracy, or suitability for any purpose. SEO results may vary and we do not guarantee specific ranking improvements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall SEOaxe be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">10. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to defend, indemnify, and hold harmless SEOaxe and its officers, directors, employees, and agents from any claims, damages, obligations, losses, liabilities, costs, or expenses arising from your use of the Service or violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">11. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of South Africa, without regard to its conflict of law provisions. Any disputes shall be subject to the exclusive jurisdiction of the courts of South Africa.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">12. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. We will provide notice of any material changes by posting the new Terms on this page. Your continued use of the Service after any changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">13. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us:
              </p>
              <p className="text-muted-foreground mt-2">
                Email: legal@seoforge.app
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
