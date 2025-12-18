
// @ts-ignore
const PDFParser = require('pdf2json');

async function testPdf() {
    console.log('Testing PDF extraction with pdf2json...');

    const pdfContent = `
%PDF-1.7
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT
/F1 24 Tf
100 700 Td
(Hello World) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000242 00000 n 
0000000329 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
423
%%EOF
`;

    const buffer = Buffer.from(pdfContent.trim());

    try {
        const text = await new Promise((resolve, reject) => {
            const pdfParser = new PDFParser(null, true);

            pdfParser.on('pdfParser_dataError', (errData: any) => {
                console.error('PDF Parser Error:', errData.parserError);
                reject(new Error('Failed to parse PDF'));
            });

            pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
                try {
                    const rawText = pdfParser.getRawTextContent();
                    resolve(rawText);
                } catch (err) {
                    reject(err);
                }
            });

            pdfParser.parseBuffer(buffer);
        });

        console.log('Success!');
        console.log('Text content:', text);
    } catch (error) {
        console.error('PDF Parsing Failed:', error);
    }
}

testPdf();
