import { motion, AnimatePresence } from 'framer-motion'
import { X, Download } from 'lucide-react'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const PdfModal = ({ doc, isOpen, onClose }) => {
    const [numPages, setNumPages] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pdfWidth, setPdfWidth] = useState(750)
    const scrollRef = useRef(null)
    const pageRefs = useRef([])

    // Calculate responsive width
    useEffect(() => {
        const updateWidth = () => setPdfWidth(Math.min(window.innerWidth - 96, 750))
        updateWidth()
        window.addEventListener('resize', updateWidth)
        return () => window.removeEventListener('resize', updateWidth)
    }, [])

    // Reset state when doc changes
    useEffect(() => {
        setNumPages(null)
        setCurrentPage(1)
        pageRefs.current = []
    }, [doc?.id])

    // Track current page based on scroll position
    const handleScroll = useCallback(() => {
        const container = scrollRef.current
        if (!container || !pageRefs.current.length) return

        const containerTop = container.scrollTop + 120 // offset for sticky header
        let closestPage = 1

        for (let i = 0; i < pageRefs.current.length; i++) {
            const el = pageRefs.current[i]
            if (el && el.offsetTop <= containerTop + 40) {
                closestPage = i + 1
            }
        }
        setCurrentPage(closestPage)
    }, [])

    if (!doc) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-start justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Overlay */}
                    <motion.div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Modal */}
                    <motion.div
                        className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col z-10 my-4 mx-4"
                        initial={{ scale: 0.92, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                    >
                        {/* Sticky header */}
                        <div
                            className="shrink-0 border-b p-5 flex items-center justify-between rounded-t-2xl"
                            style={{ borderColor: '#E5E3DF' }}
                        >
                            <div className="min-w-0 mr-4">
                                <h2
                                    className="text-lg font-bold truncate"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}
                                >
                                    {doc.title}
                                </h2>
                                {doc.type && (
                                    <p
                                        className="text-xs mt-0.5"
                                        style={{ fontFamily: "'DM Mono', monospace", color: '#4A4A6A' }}
                                    >
                                        {doc.type}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {/* Page indicator */}
                                {numPages && numPages > 1 && (
                                    <span
                                        className="text-xs px-3 py-1.5 rounded-full"
                                        style={{
                                            fontFamily: "'DM Mono', monospace",
                                            color: '#4A4A6A',
                                            backgroundColor: '#F3F4F6',
                                        }}
                                    >
                                        {currentPage} / {numPages}
                                    </span>
                                )}
                                {doc.pdf_url && (
                                    <a
                                        href={doc.pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                        style={{ color: '#FF6B35' }}
                                        title="Open in new tab"
                                    >
                                        <Download size={18} />
                                    </a>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    style={{ color: '#4A4A6A' }}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable PDF content — all pages rendered */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6"
                            onScroll={handleScroll}
                            style={{ backgroundColor: '#F9F9F7' }}
                        >
                            {doc.pdf_url ? (
                                <Document
                                    file={doc.pdf_url}
                                    onLoadSuccess={({ numPages: n }) => {
                                        setNumPages(n)
                                        setCurrentPage(1)
                                        pageRefs.current = new Array(n).fill(null)
                                    }}
                                    loading={
                                        <div className="flex items-center justify-center py-20">
                                            <div
                                                className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                                                style={{ borderColor: '#FF6B35', borderTopColor: 'transparent' }}
                                            />
                                        </div>
                                    }
                                    error={
                                        <div className="text-center py-20">
                                            <p className="text-sm mb-3" style={{ color: '#4A4A6A' }}>
                                                Unable to load PDF inline.
                                            </p>
                                            <a
                                                href={doc.pdf_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium"
                                                style={{ color: '#FF6B35' }}
                                            >
                                                Open PDF directly →
                                            </a>
                                        </div>
                                    }
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        {Array.from({ length: numPages || 0 }, (_, i) => (
                                            <div
                                                key={i}
                                                ref={(el) => { pageRefs.current[i] = el }}
                                                className="rounded-lg overflow-hidden"
                                                style={{
                                                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                                    border: '1px solid #E5E3DF',
                                                }}
                                            >
                                                <Page
                                                    pageNumber={i + 1}
                                                    width={pdfWidth}
                                                    renderTextLayer={false}
                                                    renderAnnotationLayer={false}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </Document>
                            ) : (
                                <div className="py-16 text-center">
                                    <p className="text-base" style={{ color: '#4A4A6A' }}>
                                        Document coming soon.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default PdfModal
