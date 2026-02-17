import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const capabilities = [
    {
        emoji: '🎯',
        title: 'Product Strategy',
        description: 'Roadmapping, vision setting, and ruthless prioritization to ship what matters most.',
    },
    {
        emoji: '📊',
        title: 'Data & Analytics',
        description: 'SQL, A/B testing, cohort analysis — turning numbers into actionable product insights.',
    },
    {
        emoji: '🧠',
        title: 'User Empathy',
        description: 'Deep user research, persona building, and journey mapping to truly understand needs.',
    },
    {
        emoji: '⚡',
        title: 'Technical Fluency',
        description: 'API design, system architecture conversations, and strong engineering partnership.',
    },
    {
        emoji: '✏️',
        title: 'Design Thinking',
        description: 'Wireframing, rapid prototyping, and iterative UX to validate ideas fast.',
    },
    {
        emoji: '🤝',
        title: 'Stakeholder Craft',
        description: 'Cross-functional alignment, leadership buy-in, and clear communication at every level.',
    },
]

const Skills = () => {
    const sectionRef = useRef(null)
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

    return (
        <section
            id="skills"
            ref={sectionRef}
            className="px-4 sm:px-6 py-8"
            style={{ backgroundColor: '#F5F1EB' }}
        >
            <div
                className="max-w-6xl mx-auto rounded-3xl py-20 md:py-28 px-6 sm:px-10 md:px-14"
                style={{ backgroundColor: '#1A1A2E' }}
            >
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-14"
                >
                    <p
                        className="text-sm tracking-[0.2em] uppercase mb-3"
                        style={{ fontFamily: "'DM Mono', monospace", color: '#FF6B35' }}
                    >
                        03 / Capabilities
                    </p>
                    <h2
                        className="text-4xl md:text-5xl font-bold"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#FAFAF8' }}
                    >
                        What I Bring
                    </h2>
                </motion.div>

                {/* 2×3 Capabilities Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {capabilities.map((cap, i) => (
                        <motion.div
                            key={cap.title}
                            className="rounded-2xl p-7 border transition-all duration-300 group"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.04)',
                                borderColor: 'rgba(255,255,255,0.08)',
                            }}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                            whileHover={{
                                borderColor: 'rgba(255,107,53,0.3)',
                                backgroundColor: 'rgba(255,107,53,0.06)',
                                y: -4,
                            }}
                        >
                            {/* Emoji badge */}
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-5"
                                style={{ backgroundColor: 'rgba(255,107,53,0.12)' }}
                            >
                                {cap.emoji}
                            </div>

                            <h3
                                className="text-lg font-semibold mb-2"
                                style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#FAFAF8' }}
                            >
                                {cap.title}
                            </h3>
                            <p
                                className="text-sm leading-relaxed"
                                style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(250,250,248,0.5)' }}
                            >
                                {cap.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Skills
