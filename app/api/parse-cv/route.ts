import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';

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
    
    // Use pdf-parse correctly - it's a function, not a class
    const data = await pdf(buffer);
    
    const extractedText = data.text
      .replace(/\s+/g, ' ')
      .trim();
    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json({ 
        error: 'Could not extract meaningful text from the PDF. Please ensure the PDF contains readable text (not scanned images).' 
      }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      text: extractedText,
      pages: data.numpages,
      fileName: file.name,
    });
  } catch (error) {
    console.error('PDF parsing error:', error);
    return NextResponse.json({ 
      error: 'Failed to parse PDF. Please ensure the file is a valid PDF document.' 
    }, { status: 500 });
  }
}
