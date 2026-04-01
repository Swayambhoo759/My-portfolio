import { motion } from 'framer-motion'

/**
 * Desktop: horizontal dotted line with numbered orange nodes
 * Mobile: vertical dotted line with numbered nodes alongside cards
 *
 * This component renders the DESKTOP version only.
 * The mobile vertical variant is handled inline by DocumentsGrid.
 */
const DocumentConnector = ({ count }) => {
    if (count < 2) return null

    return (
        <div className="hidden md:block relative h-10 mx-4 mb-2">
            {/* Dotted horizontal line */}
            <motion.div
                className="absolute top-1/2 left-4 right-4 h-0"
                style={{
                    borderTop: '2px dashed #E5E3DF',
                    transformOrigin: 'left',
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
            />

            {/* Numbered nodes */}
            {Array.from({ length: count }).map((_, i) => {
                // Distribute nodes evenly, with padding from edges
                const pct = count === 1 ? 50 : 4 + (i / (count - 1)) * 92

                return (
                    <motion.div
                        key={i}
                        className="absolute top-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10"
                        style={{
                            left: `${pct}%`,
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: '#FF6B35',
                            color: '#FFFFFF',
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '11px',
                            boxShadow: '0 2px 8px rgba(255, 107, 53, 0.25)',
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            delay: 0.1 + i * 0.15,
                            type: 'spring',
                            stiffness: 300,
                            damping: 20,
                        }}
                    >
                        {i + 1}
                    </motion.div>
                )
            })}
        </div>
    )
}

export default DocumentConnector
