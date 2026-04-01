import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { supabaseFrom } from '../lib/supabase'
import DocumentCard from './DocumentCard'
import DocumentConnector from './DocumentConnector'
import PdfModal from './PdfModal'

const DocumentsGrid = ({ problemId }) => {
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedDoc, setSelectedDoc] = useState(null)

    useEffect(() => {
        if (!problemId) return
        setLoading(true)
        supabaseFrom('documents')
            .select('*')
            .eq('problem_id', problemId)
            .order('order_index', { ascending: true })
            .then(({ data }) => {
                setDocuments(data || [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [problemId])

    return (
        <div className="mt-6 mb-6">
            {/* Section label */}
            <div className="flex items-center gap-2 mb-4">
                <FileText size={16} color="#FF6B35" />
                <p
                    className="text-xs font-semibold tracking-widest uppercase"
                    style={{ fontFamily: "'DM Mono', monospace", color: '#FF6B35' }}
                >
                    The Journey
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div
                        className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: '#FF6B35', borderTopColor: 'transparent' }}
                    />
                </div>
            ) : documents.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: '#9CA3AF' }}>
                    Documents coming soon.
                </p>
            ) : (
                <>
                    {/* Desktop: horizontal connector + grid */}
                    <div className="hidden md:block">
                        <DocumentConnector count={documents.length} />
                        <div className={`grid gap-5 ${documents.length === 1 ? 'grid-cols-1 max-w-sm' : documents.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                            {documents.map((doc, i) => (
                                <DocumentCard
                                    key={doc.id}
                                    doc={doc}
                                    index={i}
                                    onClick={setSelectedDoc}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Mobile: vertical timeline + stacked cards */}
                    <div className="md:hidden relative pl-9">
                        {/* Vertical dotted line */}
                        {documents.length > 1 && (
                            <motion.div
                                className="absolute left-[11px] top-4 bottom-4 w-0"
                                style={{ borderLeft: '2px dashed #E5E3DF' }}
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                            />
                        )}

                        <div className="space-y-3">
                            {documents.map((doc, i) => (
                                <div key={doc.id} className="relative">
                                    {/* Numbered node */}
                                    <motion.div
                                        className="absolute -left-9 top-5 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold z-10"
                                        style={{
                                            backgroundColor: '#FF6B35',
                                            color: '#FFFFFF',
                                            fontFamily: "'DM Mono', monospace",
                                            boxShadow: '0 2px 6px rgba(255,107,53,0.25)',
                                        }}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.1 + i * 0.12, type: 'spring', stiffness: 300 }}
                                    >
                                        {i + 1}
                                    </motion.div>
                                    <DocumentCard
                                        doc={doc}
                                        index={i}
                                        onClick={setSelectedDoc}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* PDF Modal */}
            <PdfModal
                doc={selectedDoc}
                isOpen={!!selectedDoc}
                onClose={() => setSelectedDoc(null)}
            />
        </div>
    )
}

export default DocumentsGrid
