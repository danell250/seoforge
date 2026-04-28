import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SUPPORT_EMAIL } from "@/lib/brand-metadata";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Refund Policy</h1>

          <div className="prose prose-slate max-w-none">
            <p className="text-muted-foreground mb-6">
              Last updated: {new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">1. Our approach</h2>
              <p className="text-muted-foreground leading-relaxed">
                We want SEOaxe to feel low-risk to try. If you start a paid monthly plan and it is clearly not the right fit, we would rather handle that fairly than trap you in a subscription you do not want.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">2. First subscription refunds</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Your first charge on a paid monthly plan is eligible for a full refund if all of the following are true:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>You contact us within 14 calendar days of the first paid charge</li>
                <li>The request is for your first paid subscription with SEOaxe</li>
                <li>Your account has not been used in a clearly abusive, fraudulent, or high-volume way</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">3. Renewals and plan changes</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Subscription renewals are generally non-refundable once the new billing period has started. You can cancel at any time to stop future renewals.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you were charged twice, upgraded by mistake, or ran into a billing error, contact us and we will review it promptly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">4. What is not refundable</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Partial months after a renewal has already started</li>
                <li>Unused time on an active billing cycle after cancellation</li>
                <li>Accounts suspended for abuse, fraud, or violations of the Terms of Service</li>
                <li>Custom services, one-off implementation help, or other bespoke work unless we agree otherwise in writing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">5. How to request a refund</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Email us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>The email address on your account</li>
                <li>The plan you purchased</li>
                <li>A short note about what went wrong</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                We aim to review refund requests within 3 business days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">6. Processing time</h2>
              <p className="text-muted-foreground leading-relaxed">
                If a refund is approved, we will send it back through the original payment method where possible. Banks and payment providers can take additional time to post the funds to your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">7. Consumer rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                This policy is meant to be clear and customer-friendly, but it does not limit any refund or cancellation rights you may have under applicable law.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
