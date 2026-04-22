import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SinglePageOptimizer } from "@/components/app/single-page-optimizer";
import { ZipUpload } from "@/components/app/zip-upload";
import { CompetitorScanner } from "@/components/app/competitor-scanner";
import { SiteCrawler } from "@/components/app/site-crawler";
import { AeoAnswerBlock } from "@/components/app/aeo-answer-block";
import { DeployPanel } from "@/components/app/deploy-panel";

export default function AppWorkspace() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      
      <main className="flex-1 py-8 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Optimization Workspace</h1>
            <p className="text-muted-foreground mt-2">
              Optimize HTML files, process bulk ZIPs, or scan competitors for insights.
            </p>
          </div>

          <Tabs defaultValue="single-page" className="w-full">
            <TabsList className="mb-8 w-full md:w-auto inline-flex overflow-x-auto">
              <TabsTrigger value="single-page" className="flex-1 md:flex-none">Single Page</TabsTrigger>
              <TabsTrigger value="aeo-block" className="flex-1 md:flex-none">AEO Answer Blocks</TabsTrigger>
              <TabsTrigger value="site-crawler" className="flex-1 md:flex-none">Full Site Crawler</TabsTrigger>
              <TabsTrigger value="zip-upload" className="flex-1 md:flex-none">Bulk ZIP Upload</TabsTrigger>
              <TabsTrigger value="competitor" className="flex-1 md:flex-none">Competitor Scanner</TabsTrigger>
              <TabsTrigger value="deploy" className="flex-1 md:flex-none">Deploy</TabsTrigger>
            </TabsList>

            <TabsContent value="single-page" className="m-0">
              <SinglePageOptimizer />
            </TabsContent>

            <TabsContent value="site-crawler" className="m-0">
              <SiteCrawler />
            </TabsContent>

            <TabsContent value="zip-upload" className="m-0">
              <ZipUpload />
            </TabsContent>

            <TabsContent value="aeo-block" className="m-0">
              <AeoAnswerBlock />
            </TabsContent>

            <TabsContent value="competitor" className="m-0">
              <CompetitorScanner />
            </TabsContent>

            <TabsContent value="deploy" className="m-0">
              <DeployPanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
