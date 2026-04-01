import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import ContextSection from './ContextSection'
import DocumentsGrid from './DocumentsGrid'
import OutcomeSection from './OutcomeSection'

const TAG_COLORS = {
    'B2C':        { bg: '#DBEAFE', text: '#1D4ED8' },
    'B2B':        { bg: '#F3E8FF', text: '#7C3AED' },
    'Consumer':   { bg: '#DBEAFE', text: '#1D4ED8' },
    'Travel':     { bg: '#CCFBF1', text: '#0F766E' },
    'AgTech':     { bg: '#DCFCE7', text: '#15803D' },
    'FinTech':    { bg: '#FEF3C7', text: '#B45309' },
    'SaaS':       { bg: '#E0E7FF', text: '#4338CA' },
    'HealthTech': { bg: '#FCE7F3', text: '#BE185D' },
    'GenAI':      { bg: '#FDF2F8', text: '#DB2777' },
    'Analytics':  { bg: '#FEF9C3', text: '#A16207' },
    'Platform':   { bg: '#F1F5F9', text: '#475569' },
    'Mobile':     { bg: '#FFF0EA', text: '#EA580C' },
}

const fallbackColor = { bg: '#F3F4F6', text: '#374151' }

const getTagColor = (tag) => TAG_COLORS[tag] || fallbackColor

const ProjectCard = ({ project, index, isExpanded, onToggle, documentCount = 0 }) => {
    const displayNumber = String(index + 1).padStart(2, '0')
    const tags = Array.isArray(project.tags) ? project.tags : []

    return (
        <motion.div
            className="bg-white rounded-2xl border overflow-hidden transition-shadow"
            style={{
                borderColor: isExpanded ? '#FF6B35' : '#E5E3DF',
                boxShadow: isExpanded ? '0 8px 32px rgba(255, 107, 53, 0.1)' : 'none',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            layout
        >
            {/* ── Collapsed tile (always visible) ── */}
            <div
                className="cursor-pointer group"
                onClick={onToggle}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onToggle()}
            >
                {/* Thumbnail */}
                <div
                    className="w-full h-48 overflow-hidden relative"
                    style={{ backgroundColor: '#F2F1EE' }}
                >
                    {project.thumbnail_url ? (
                        <img
                            src={project.thumbnail_url}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                            <span
                                className="text-[7rem] font-bold select-none leading-none"
                                style={{
                                    fontFamily: "'Space Grotesk', sans-serif",
                                    color: 'rgba(255, 107, 53, 0.07)',
                                }}
                            >
                                {displayNumber}
                            </span>
                            <div
                                className="absolute inset-0 opacity-15"
                                style={{
                                    backgroundImage:
                                        'repeating-linear-gradient(0deg, transparent, transparent 28px, #E5E3DF 28px, #E5E3DF 29px), repeating-linear-gradient(90deg, transparent, transparent 28px, #E5E3DF 28px, #E5E3DF 29px)',
                                }}
                            />
                        </div>
                    )}

                    {/* Bottom gradient overlay */}
                    {project.thumbnail_url && (
                        <div
                            className="absolute inset-x-0 bottom-0 h-16"
                            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.15), transparent)' }}
                        />
                    )}

                    {/* Doc count badge */}
                    {documentCount > 0 && (
                        <span
                            className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                            style={{
                                fontFamily: "'DM Mono', monospace",
                                backgroundColor: 'rgba(255,255,255,0.88)',
                                color: '#4A4A6A',
                                border: '1px solid rgba(0,0,0,0.06)',
                            }}
                        >
                            {documentCount} doc{documentCount !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Body */}
                <div className="p-5">
                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {tags.slice(0, 4).map((tag) => {
                                const color = getTagColor(tag)
                                return (
                                    <span
                                        key={tag}
                                        className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                                        style={{
                                            fontFamily: "'DM Mono', monospace",
                                            backgroundColor: color.bg,
                                            color: color.text,
                                        }}
                                    >
                                        {tag}
                                    </span>
                                )
                            })}
                            {tags.length > 4 && (
                                <span
                                    className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                                    style={{ fontFamily: "'DM Mono', monospace", backgroundColor: '#F3F4F6', color: '#374151' }}
                                >
                                    +{tags.length - 4}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Title */}
                    <h3
                        className="text-xl font-semibold leading-snug mb-2 line-clamp-2"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}
                    >
                        {project.title}
                    </h3>

                    {/* Problem statement */}
                    <p
                        className="text-sm leading-relaxed line-clamp-2 mb-4"
                        style={{ fontFamily: "'Inter', sans-serif", color: '#4A4A6A' }}
                    >
                        {project.problem_statement}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center justify-between">
                        <span
                            className="inline-flex items-center gap-1.5 text-sm font-medium"
                            style={{ fontFamily: "'DM Mono', monospace", color: '#FF6B35' }}
                        >
                            {isExpanded ? 'Close story' : 'Read story →'}
                        </span>
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChevronDown size={18} color="#FF6B35" />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* ── Expanded accordion content ── */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className="overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                            height: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
                            opacity: { duration: 0.25, delay: 0.1 },
                        }}
                    >
                        <div
                            className="px-5 pb-6 pt-2"
                            style={{ borderTop: '1px solid #E5E3DF' }}
                        >
                            {/* Context */}
                            <ContextSection context={project.context} />

                            {/* Documents timeline */}
                            <DocumentsGrid problemId={project.id} />

                            {/* Outcome */}
                            <OutcomeSection
                                keyMetrics={project.key_metrics}
                                keyLearnings={project.key_learnings}
                                nextSteps={project.next_steps}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default ProjectCard
