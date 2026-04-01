import { motion } from 'framer-motion'
import { FileText, ArrowRight } from 'lucide-react'

const typeBadgeColors = {
    'PRD':                 { bg: '#DBEAFE', text: '#1D4ED8', accent: '#3B82F6' },
    'Product Improvement': { bg: '#FFF0EA', text: '#EA580C', accent: '#F97316' },
    'MVP PRD':             { bg: '#F3E8FF', text: '#7C3AED', accent: '#8B5CF6' },
    'Wireframes':          { bg: '#DCFCE7', text: '#15803D', accent: '#22C55E' },
    'Data Analysis':       { bg: '#FEF9C3', text: '#A16207', accent: '#EAB308' },
    'Market Case Study':   { bg: '#FCE7F3', text: '#BE185D', accent: '#EC4899' },
    'Teardown':            { bg: '#FEE2E2', text: '#DC2626', accent: '#EF4444' },
    'Research Paper':      { bg: '#E0F2FE', text: '#0369A1', accent: '#0EA5E9' },
    'Case Study':          { bg: '#FEF3C7', text: '#B45309', accent: '#F59E0B' },
    'Product Teardown':    { bg: '#FEE2E2', text: '#DC2626', accent: '#EF4444' },
    'Other':               { bg: '#F3F4F6', text: '#374151', accent: '#6B7280' },
}

const DocumentCard = ({ doc, index, onClick }) => {
    const badge = typeBadgeColors[doc.type] || typeBadgeColors['Other']
    const seqNum = String(index + 1).padStart(2, '0')

    return (
        <motion.div
            className="relative rounded-xl cursor-pointer group overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #F7F3EF 0%, #F2EDE8 100%)',
                border: '1px solid #DDD8D2',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.35 }}
            whileHover={{
                y: -4,
                boxShadow: '0 8px 24px rgba(255, 107, 53, 0.12)',
                borderColor: '#FF6B35',
            }}
            onClick={() => onClick?.(doc)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick?.(doc)}
        >
            {/* Left accent bar */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-300"
                style={{ backgroundColor: badge.accent, opacity: 0.7 }}
            />

            <div className="p-5 pl-6">
                {/* Ghost sequence number */}
                <span
                    className="absolute top-3 right-4 text-4xl font-bold select-none pointer-events-none"
                    style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        color: 'rgba(26, 26, 46, 0.05)',
                    }}
                >
                    {seqNum}
                </span>

                {/* Type badge */}
                <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-3"
                    style={{
                        fontFamily: "'DM Mono', monospace",
                        backgroundColor: badge.bg,
                        color: badge.text,
                    }}
                >
                    {doc.type}
                </span>

                {/* Title */}
                <h4
                    className="text-base font-semibold leading-snug mb-1.5 line-clamp-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}
                >
                    {doc.title}
                </h4>

                {/* Summary */}
                {doc.short_summary && (
                    <p
                        className="text-sm leading-relaxed line-clamp-2 mb-4"
                        style={{ fontFamily: "'Inter', sans-serif", color: '#4A4A6A' }}
                    >
                        {doc.short_summary}
                    </p>
                )}

                {/* CTA */}
                <div className="mt-auto pt-2">
                    {doc.pdf_url ? (
                        <span
                            className="inline-flex items-center gap-2 text-sm font-semibold px-3.5 py-1.5 rounded-lg transition-colors duration-200"
                            style={{
                                fontFamily: "'DM Mono', monospace",
                                color: '#FF6B35',
                                backgroundColor: '#FFF5F0',
                                border: '1px solid #FFE0D0',
                            }}
                        >
                            <FileText size={14} />
                            View
                            <motion.span
                                className="inline-block"
                                initial={{ x: 0 }}
                                whileHover={{ x: 3 }}
                            >
                                <ArrowRight size={14} />
                            </motion.span>
                        </span>
                    ) : (
                        <span
                            className="text-xs font-medium"
                            style={{ color: '#9CA3AF' }}
                        >
                            Coming Soon
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

export default DocumentCard
