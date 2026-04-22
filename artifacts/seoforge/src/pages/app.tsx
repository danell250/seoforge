import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SinglePageOptimizer } from "@/components/app/single-page-optimizer";
import { ZipUpload } from "@/components/app/zip-upload";
import { CompetitorScanner } from "@/components/app/competitor-scanner";

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
              <TabsTrigger value="zip-upload" className="flex-1 md:flex-none">Bulk ZIP Upload</TabsTrigger>
              <TabsTrigger value="competitor" className="flex-1 md:flex-none">Competitor Scanner</TabsTrigger>
            </TabsList>
            
            <TabsContent value="single-page" className="m-0">
              <SinglePageOptimizer />
            </TabsContent>
            
            <TabsContent value="zip-upload" className="m-0">
              <ZipUpload />
            </TabsContent>
            
            <TabsContent value="competitor" className="m-0">
              <CompetitorScanner />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
