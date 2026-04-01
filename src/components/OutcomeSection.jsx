import { motion } from 'framer-motion'
import { TrendingUp, Lightbulb, RefreshCw } from 'lucide-react'

const cards = [
    {
        key: 'metrics',
        label: 'Key Metrics',
        icon: TrendingUp,
        bg: '#FFF8F5',
        border: '#FFD4C2',
        accent: '#FF6B35',
        field: 'key_metrics',
    },
    {
        key: 'learnings',
        label: 'Key Learnings',
        icon: Lightbulb,
        bg: '#F0FDF4',
        border: '#BBF7D0',
        accent: '#16A34A',
        field: 'key_learnings',
    },
    {
        key: 'nextSteps',
        label: 'Next Steps',
        icon: RefreshCw,
        bg: '#EFF6FF',
        border: '#BFDBFE',
        accent: '#2563EB',
        field: 'next_steps',
    },
]

const OutcomeSection = ({ keyMetrics, keyLearnings, nextSteps }) => {
    const values = { key_metrics: keyMetrics, key_learnings: keyLearnings, next_steps: nextSteps }
    const visibleCards = cards.filter((c) => values[c.field])

    if (visibleCards.length === 0) return null

    return (
        <div
            className="mt-8 pt-6"
            style={{ borderTop: '1px solid #E5E3DF' }}
        >
            {/* Section label */}
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} color="#2D6A4F" />
                <p
                    className="text-xs font-semibold tracking-widest uppercase"
                    style={{ fontFamily: "'DM Mono', monospace", color: '#2D6A4F' }}
                >
                    Outcome & Impact
                </p>
            </div>

            {/* Cards grid */}
            <div className={`grid gap-4 ${visibleCards.length === 1 ? 'grid-cols-1' : visibleCards.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
                {visibleCards.map((card, i) => {
                    const Icon = card.icon
                    return (
                        <motion.div
                            key={card.key}
                            className="rounded-xl p-5"
                            style={{
                                backgroundColor: card.bg,
                                border: `1px solid ${card.border}`,
                            }}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i, duration: 0.35 }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Icon size={14} color={card.accent} />
                                <p
                                    className="text-xs font-semibold tracking-wider uppercase"
                                    style={{
                                        fontFamily: "'DM Mono', monospace",
                                        color: card.accent,
                                    }}
                                >
                                    {card.label}
                                </p>
                            </div>
                            <p
                                className="text-sm leading-relaxed"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    color: '#1A1A2E',
                                }}
                            >
                                {values[card.field]}
                            </p>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

export default OutcomeSection
