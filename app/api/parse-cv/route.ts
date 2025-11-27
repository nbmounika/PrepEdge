import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_MIME_TYPES = ['application/pdf'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF files are allowed.' }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const pdfSignature = buffer.slice(0, 5).toString();
    if (!pdfSignature.startsWith('%PDF-')) {
      return NextResponse.json({ error: 'Invalid PDF file. The file does not appear to be a valid PDF.' }, { status: 400 });
    }
    
    // Dynamic import pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    const typedArray = new Uint8Array(arrayBuffer);
    const loadingTask = pdfjsLib.getDocument({ data: typedArray });
    const pdfDocument = await loadingTask.promise;
    
    let extractedText = '';
    
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      extractedText += pageText + ' ';
    }
    
    extractedText = extractedText.replace(/\s+/g, ' ').trim();
    
    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json({ 
        error: 'Could not extract meaningful text from the PDF. Please ensure the PDF contains readable text (not scanned images).' 
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      text: extractedText,
      pages: pdfDocument.numPages,
      fileName: file.name,
    });
  } catch (error) {
    console.error('PDF parsing error:', error);
    return NextResponse.json({ 
      error: 'Failed to parse PDF. Please ensure the file is a valid PDF document.' 
    }, { status: 500 });
  }
}
