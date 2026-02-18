import { motion, AnimatePresence } from 'framer-motion'
import { X, Download } from 'lucide-react'
import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const typeBadgeColors = {
    'PRD': { bg: '#DBEAFE', text: '#1D4ED8' },
    'Product Improvement': { bg: '#FFF0EA', text: '#EA580C' },
    'MVP PRD': { bg: '#F3E8FF', text: '#7C3AED' },
    'Wireframes': { bg: '#DCFCE7', text: '#15803D' },
    'Data Analysis': { bg: '#FEF9C3', text: '#A16207' },
    'Market Case Study': { bg: '#FCE7F3', text: '#BE185D' },
    'Teardown': { bg: '#FEE2E2', text: '#DC2626' },
    'Other': { bg: '#F3F4F6', text: '#374151' },
}

const ProjectModal = ({ project, isOpen, onClose }) => {
    const [numPages, setNumPages] = useState(null)
    const [pageNumber, setPageNumber] = useState(1)

    if (!project) return null
    const badge = typeBadgeColors[project.type] || typeBadgeColors['Other']

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages)
        setPageNumber(1)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
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
                        className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b p-6 flex items-start justify-between rounded-t-2xl z-10" style={{ borderColor: '#E5E3DF' }}>
                            <div>
                                <span
                                    className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2"
                                    style={{
                                        fontFamily: "'DM Mono', monospace",
                                        backgroundColor: badge.bg,
                                        color: badge.text,
                                    }}
                                >
                                    {project.type}
                                </span>
                                <h2
                                    className="text-2xl font-bold"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}
                                >
                                    {project.title}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                {project.pdf_url && (
                                    <a
                                        href={project.pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                        style={{ color: '#FF6B35' }}
                                    >
                                        <Download size={20} />
                                    </a>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    style={{ color: '#4A4A6A' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {project.pdf_url ? (
                                <div className="flex flex-col items-center">
                                    <Document
                                        file={project.pdf_url}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        loading={
                                            <div className="flex items-center justify-center py-20">
                                                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FF6B35', borderTopColor: 'transparent' }} />
                                            </div>
                                        }
                                        error={
                                            <div className="text-center py-20">
                                                <p style={{ color: '#4A4A6A' }}>Unable to load PDF. </p>
                                                <a
                                                    href={project.pdf_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-2 inline-block text-sm font-medium"
                                                    style={{ color: '#FF6B35' }}
                                                >
                                                    Open PDF directly →
                                                </a>
                                            </div>
                                        }
                                    >
                                        <Page
                                            pageNumber={pageNumber}
                                            width={Math.min(window.innerWidth - 80, 750)}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                        />
                                    </Document>

                                    {numPages && numPages > 1 && (
                                        <div className="flex items-center gap-4 mt-6 py-3 px-6 rounded-full bg-gray-50">
                                            <button
                                                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                                                disabled={pageNumber <= 1}
                                                className="text-sm font-medium disabled:opacity-30 transition-opacity"
                                                style={{ color: '#1A1A2E' }}
                                            >
                                                ← Prev
                                            </button>
                                            <span
                                                className="text-xs"
                                                style={{ fontFamily: "'DM Mono', monospace", color: '#4A4A6A' }}
                                            >
                                                {pageNumber} / {numPages}
                                            </span>
                                            <button
                                                onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                                                disabled={pageNumber >= numPages}
                                                className="text-sm font-medium disabled:opacity-30 transition-opacity"
                                                style={{ color: '#1A1A2E' }}
                                            >
                                                Next →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <p className="text-lg" style={{ color: '#4A4A6A' }}>
                                        {project.description}
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

export default ProjectModal
