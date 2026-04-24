import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageCircle, Clock, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 py-12 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about SEOForge? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Contact Methods */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email Support</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        For general inquiries and support
                      </p>
                      <a 
                        href="mailto:support@seoforge.app" 
                        className="text-primary hover:underline text-sm"
                      >
                        support@seoforge.app
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Live Chat</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Available for Pro and Enterprise users
                      </p>
                      <span className="text-sm text-muted-foreground">
                        Inside the app workspace
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Business Hours</h3>
                      <p className="text-sm text-muted-foreground">
                        Monday - Friday<br />
                        09:00 - 17:00 SAST (South Africa Standard Time)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Location</h3>
                      <p className="text-sm text-muted-foreground">
                        South Africa<br />
                        Serving clients nationwide
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Contact Form */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Send us a message</h3>
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-1.5">
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        required
                      >
                        <option value="">Select a topic</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="billing">Billing Question</option>
                        <option value="enterprise">Enterprise / Agency</option>
                        <option value="partnership">Partnership</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-1.5">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                        placeholder="How can we help you?"
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="border-t pt-12">
            <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-2">How quickly do you respond?</h3>
                  <p className="text-sm text-muted-foreground">
                    We typically respond to email inquiries within 24 business hours. Pro and Enterprise users receive priority support with faster response times.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-2">Do you offer phone support?</h3>
                  <p className="text-sm text-muted-foreground">
                    Phone support is available for Enterprise customers. All other plans can reach us via email or live chat within the app.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-2">Can I schedule a demo?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! We offer personalized demos for agencies and enterprise teams. Select "Enterprise / Agency" in the subject dropdown above.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-2">Where can I find documentation?</h3>
                  <p className="text-sm text-muted-foreground">
                    Check our Help Center and API documentation accessible from the workspace. We're continuously adding guides and tutorials.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
