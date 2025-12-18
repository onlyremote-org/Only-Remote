// @ts-ignore
import PDFParser from 'pdf2json'
import mammoth from 'mammoth'

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    console.log('Starting PDF extraction with pdf2json. Buffer size:', buffer.length)
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, true) // true for text only

        pdfParser.on('pdfParser_dataError', (errData: any) => {
            console.error('PDF Parser Error Event:', JSON.stringify(errData))
            reject(new Error('Failed to parse PDF: ' + (errData.parserError || 'Unknown error')))
        })

        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
            try {
                console.log('PDF Data Ready. Pages:', pdfData.Pages?.length)

                // Manually extract text to avoid getRawTextContent() bugs
                let text = ''
                if (pdfData.Pages) {
                    for (const page of pdfData.Pages) {
                        if (page.Texts) {
                            for (const textItem of page.Texts) {
                                if (textItem.R && textItem.R.length > 0) {
                                    // R[0].T is the text content, URI encoded
                                    const rawText = textItem.R[0].T
                                    try {
                                        const str = decodeURIComponent(rawText)
                                        text += str + ' '
                                    } catch (e) {
                                        // Fallback for malformed URI sequences
                                        text += rawText + ' '
                                    }
                                }
                            }
                        }
                        text += '\n' // Newline between pages
                    }
                }

                console.log('Extracted text length:', text.length)
                resolve(text)
            } catch (err) {
                console.error('Error processing PDF data:', err)
                reject(err)
            }
        })

        try {
            pdfParser.parseBuffer(buffer)
        } catch (err) {
            console.error('Error calling parseBuffer:', err)
            reject(err)
        }
    })
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
    try {
        const result = await mammoth.extractRawText({ buffer })
        return result.value
    } catch (error) {
        console.error('Error extracting text from DOCX:', error)
        throw new Error('Failed to extract text from DOCX')
    }
}

export function normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim()
}
