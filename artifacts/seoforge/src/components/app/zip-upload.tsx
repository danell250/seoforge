import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useOptimizeHtml } from "@workspace/api-client-react";
import { UploadCloud, FileArchive, CheckCircle2, Download, AlertCircle, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface ProcessedFile {
  filename: string;
  originalHtml: string;
  optimizedHtml?: string;
  changes?: string[];
  score?: { overall: number; technical: number; content: number; aeo: number };
  status: "pending" | "processing" | "success" | "error";
  error?: string;
}

export function ZipUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const optimizeMutation = useOptimizeHtml();

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.zip')) {
      await processZipFile(file);
    } else {
      toast({ title: "Invalid file", description: "Please upload a .zip file.", variant: "destructive" });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      await processZipFile(file);
    }
  };

  const processZipFile = async (file: File) => {
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      const htmlFiles: ProcessedFile[] = [];
      
      for (const [filename, zipEntry] of Object.entries(contents.files)) {
        if (!zipEntry.dir && (filename.endsWith('.html') || filename.endsWith('.htm'))) {
          const content = await zipEntry.async("text");
          htmlFiles.push({
            filename,
            originalHtml: content,
            status: "pending"
          });
        }
      }
      
      if (htmlFiles.length === 0) {
        toast({ title: "Empty ZIP", description: "No HTML files found in the archive.", variant: "destructive" });
        return;
      }
      
      setFiles(htmlFiles);
    } catch (error) {
      toast({ title: "Error", description: "Failed to read ZIP file.", variant: "destructive" });
    }
  };

  const startProcessing = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    const updatedFiles = [...files];
    
    for (let i = 0; i < updatedFiles.length; i++) {
      const file = updatedFiles[i];
      setCurrentFile(file.filename);
      updatedFiles[i].status = "processing";
      setFiles([...updatedFiles]);
      
      try {
        const result = await optimizeMutation.mutateAsync({
          data: { html: file.originalHtml, filename: file.filename }
        });
        
        updatedFiles[i] = {
          ...file,
          optimizedHtml: result.optimizedHtml,
          changes: result.changes,
          score: result.score,
          status: "success"
        };
      } catch (error) {
        updatedFiles[i] = {
          ...file,
          status: "error",
          error: "Optimization failed"
        };
      }
      
      setProgress(((i + 1) / updatedFiles.length) * 100);
      setFiles([...updatedFiles]);
    }
    
    setIsProcessing(false);
    setCurrentFile("");
    toast({ title: "Processing Complete", description: `Successfully optimized ${updatedFiles.filter(f => f.status === 'success').length} files.` });
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    let hasFiles = false;
    
    files.forEach(file => {
      if (file.status === "success" && file.optimizedHtml) {
        zip.file(file.filename, file.optimizedHtml);
        hasFiles = true;
      }
    });
    
    if (hasFiles) {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "seoforge-optimized.zip");
    } else {
      toast({ title: "No files to download", variant: "destructive" });
    }
  };

  const downloadSingle = (file: ProcessedFile) => {
    if (!file.optimizedHtml) return;
    const blob = new Blob([file.optimizedHtml], { type: "text/html;charset=utf-8" });
    saveAs(blob, file.filename);
  };

  const reset = () => {
    setFiles([]);
    setProgress(0);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {files.length === 0 ? (
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Bulk ZIP Processing</CardTitle>
            <CardDescription>Upload an archive containing multiple HTML files to optimize them all automatically.</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className={`mt-4 border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={handleDrop}
            >
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <FileArchive className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Drag & drop your .zip file here</h3>
              <p className="text-sm text-muted-foreground mb-6">Contains .html or .htm files. Folders are supported.</p>
              
              <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                <UploadCloud className="h-4 w-4 mr-2" /> Browse Files
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".zip" 
                onChange={handleFileSelect} 
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <div>
              <CardTitle>Batch Optimization</CardTitle>
              <CardDescription>{files.length} files loaded from archive</CardDescription>
            </div>
            {!isProcessing && progress === 100 ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={reset}>Upload New</Button>
                <Button onClick={downloadAll} className="gap-2">
                  <Download className="h-4 w-4" /> Download All Optimized
                </Button>
              </div>
            ) : (
              <Button onClick={startProcessing} disabled={isProcessing} className="gap-2">
                {isProcessing ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" /> Start Optimization</>
                )}
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="pt-6">
            {isProcessing && (
              <div className="mb-8 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-primary">Optimizing page {Math.ceil((progress / 100) * files.length)} of {files.length}…</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground truncate">Current file: {currentFile}</p>
              </div>
            )}
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Changes</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium max-w-[200px] truncate" title={file.filename}>
                        {file.filename}
                      </TableCell>
                      <TableCell>
                        {file.status === "pending" && <span className="text-muted-foreground text-sm">Waiting</span>}
                        {file.status === "processing" && <span className="text-blue-500 text-sm flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> Processing</span>}
                        {file.status === "success" && <span className="text-green-500 text-sm flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Done</span>}
                        {file.status === "error" && <span className="text-red-500 text-sm flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Error</span>}
                      </TableCell>
                      <TableCell>
                        {file.score ? (
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${file.score.overall >= 80 ? 'text-green-500' : file.score.overall >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                              {file.score.overall}
                            </span>
                            <span className="text-xs text-muted-foreground">/100</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {file.changes ? `${file.changes.length} updates` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => downloadSingle(file)}
                          disabled={file.status !== "success"}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
