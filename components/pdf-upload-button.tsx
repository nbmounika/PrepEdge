"use client";

import { FileText, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PDFUploadButtonProps {
  onPDFExtracted: (text: string, fileName: string) => void;
  disabled?: boolean;
}

export function PDFUploadButton({ onPDFExtracted, disabled }: PDFUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      toast.error('Please select a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to process PDF');
        return;
      }

      const result = await response.json();
      onPDFExtracted(result.text, result.fileName);
      toast.success(`PDF processed: ${result.pageCount} pages extracted`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload PDF');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isLoading}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="cursor-pointer gap-2 rounded-xl border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 font-medium"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileText className="size-4" />
        )}
        {isLoading ? 'Processing...' : 'Upload PDF'}
      </Button>
    </>
  );
}
