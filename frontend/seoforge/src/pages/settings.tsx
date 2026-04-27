import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetAgencySettings,
  useUpdateAgencySettings,
  getGetAgencySettingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Brush, CheckCircle2, RefreshCw, Save } from "lucide-react";

export default function Settings() {
  const { data, isLoading } = useGetAgencySettings();
  const update = useUpdateAgencySettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [brandName, setBrandName] = useState("");
  const [tagline, setTagline] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [supportEmail, setSupportEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  useEffect(() => {
    if (data) {
      setBrandName(data.brandName);
      setTagline(data.tagline);
      setLogoUrl(data.logoUrl ?? "");
      setPrimaryColor(data.primaryColor);
      setSupportEmail(data.supportEmail ?? "");
      setWebsiteUrl(data.websiteUrl ?? "");
    }
  }, [data]);

  const handleSave = () => {
    if (!brandName.trim() || !tagline.trim()) {
      toast({ title: "Brand name and tagline required", variant: "destructive" });
      return;
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(primaryColor)) {
      toast({ title: "Invalid color", description: "Use a 6-digit hex like #2563eb.", variant: "destructive" });
      return;
    }
    update.mutate(
      {
        data: {
          brandName: brandName.trim(),
          tagline: tagline.trim(),
          logoUrl: logoUrl.trim() || null,
          primaryColor,
          supportEmail: supportEmail.trim() || null,
          websiteUrl: websiteUrl.trim() || null,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAgencySettingsQueryKey() });
          toast({ title: "Saved", description: "Branding updated everywhere." });
        },
        onError: () => toast({ title: "Save failed", description: "Please try again.", variant: "destructive" }),
      },
    );
  };

  const handleReset = () => {
    setBrandName("SEODomination");
    setTagline("AI-Powered SEO and Answer Engine Optimization");
    setLogoUrl("");
    setPrimaryColor("#2563eb");
    setSupportEmail("");
    setWebsiteUrl("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">White Label Settings</h1>
            <p className="text-muted-foreground">
              Rebrand the platform as your own. Sell it to your clients under your agency name.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">Loading settings...</div>
          ) : (
            <Card className="shadow-md">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brush className="h-5 w-5 text-primary" /> Agency branding
                </CardTitle>
                <CardDescription>Changes apply instantly across the entire app.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Brand name *</label>
                  <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} maxLength={60} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Primary color *</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-14 rounded border cursor-pointer"
                    />
                    <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} maxLength={7} />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Tagline *</label>
                  <Textarea value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={200} rows={2} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Logo URL</label>
                  <Input
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://yourcdn.com/logo.svg"
                  />
                  {logoUrl && (
                    <div className="mt-2 p-3 bg-muted/30 border rounded-md flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Preview:</span>
                      <img src={logoUrl} alt="logo preview" className="h-8 w-auto" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Support email</label>
                  <Input
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="hello@youragency.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Agency website</label>
                  <Input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://youragency.com"
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t px-6 py-4 flex justify-between items-center">
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Reset to defaults
                </Button>
                <div className="flex items-center gap-3">
                  {update.isSuccess && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Saved
                    </span>
                  )}
                  <Button onClick={handleSave} disabled={update.isPending} size="lg" className="gap-2 px-6">
                    {update.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Save changes
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
