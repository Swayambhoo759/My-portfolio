import { motion } from 'framer-motion'

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

const ProjectCard = ({ project, index, onClick }) => {
    const badge = typeBadgeColors[project.type] || typeBadgeColors['Other']
    const displayNumber = String(index + 1).padStart(2, '0')

    return (
        <motion.div
            className="relative bg-white rounded-2xl border overflow-hidden p-6 group"
            style={{ borderColor: '#E5E3DF' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{
                y: -6,
                boxShadow: '0 20px 40px rgba(255, 107, 53, 0.15)',
                borderColor: '#FF6B35',
            }}
            onClick={() => onClick?.(project)}
            role="button"
            tabIndex={0}
        >
            {/* Decorative number */}
            <span
                className="absolute top-4 right-4 text-6xl font-bold select-none pointer-events-none"
                style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: 'rgba(26, 26, 46, 0.05)',
                }}
            >
                {displayNumber}
            </span>

            {/* Type badge */}
            <span
                className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
                style={{
                    fontFamily: "'DM Mono', monospace",
                    backgroundColor: badge.bg,
                    color: badge.text,
                }}
            >
                {project.type}
            </span>

            {/* Title */}
            <h3
                className="text-xl font-semibold mb-2 relative z-10"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}
            >
                {project.title}
            </h3>

            {/* Description */}
            <p
                className="text-sm leading-relaxed mb-6 line-clamp-3"
                style={{ fontFamily: "'Inter', sans-serif", color: '#4A4A6A' }}
            >
                {project.description}
            </p>

            {/* CTA */}
            <div className="mt-auto">
                {project.pdf_url ? (
                    <span
                        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                        style={{ color: '#FF6B35' }}
                    >
                        View Project
                        <motion.span
                            className="inline-block"
                            animate={{ x: 0 }}
                            whileHover={{ x: 4 }}
                        >
                            →
                        </motion.span>
                    </span>
                ) : (
                    <span
                        className="text-sm font-medium"
                        style={{ color: '#9CA3AF' }}
                    >
                        Coming Soon
                    </span>
                )}
            </div>
        </motion.div>
    )
}

export default ProjectCard
