import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const About = () => {
    const sectionRef = useRef(null)
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

    const paragraphs = [
        "I'm a Product Manager based in Gurugram, sitting at the intersection of user empathy and business strategy. I believe every great product starts with a single question: what does this person actually need?",
        "My approach is rooted in V² thinking — delivering genuine Value to users while ensuring Viability for the business. This isn't just a framework for me. It's a lens I apply to every decision, every feature, every trade-off.",
        "Currently at TST Group, I lead cross-functional teams bridging product, engineering, and business. Before that, I spent time going deep on product craft — teardowns, research, prototypes, and more.",
    ]

    return (
        <section
            id="about"
            ref={sectionRef}
            className="py-20 md:py-28 px-4 sm:px-6"
            style={{ backgroundColor: '#F5F1EB' }}
        >
            <div className="max-w-6xl mx-auto">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <p
                        className="text-sm tracking-[0.2em] uppercase mb-3"
                        style={{ fontFamily: "'DM Mono', monospace", color: '#FF6B35' }}
                    >
                        01 / About
                    </p>
                    <h2
                        className="text-4xl md:text-5xl font-bold relative inline-block"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}
                    >
                        About Me
                        <motion.span
                            className="absolute -bottom-2 left-0 h-1 rounded-full"
                            style={{ backgroundColor: '#FF6B35' }}
                            initial={{ width: 0 }}
                            animate={isInView ? { width: '100%' } : {}}
                            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                        />
                    </h2>
                </motion.div>

                {/* Bento-style content card */}
                <motion.div
                    className="rounded-3xl border p-8 sm:p-10 md:p-12 relative overflow-hidden"
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DF' }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    {/* Vertical accent bar */}
                    <motion.div
                        className="absolute left-0 top-0 w-1 rounded-r-full"
                        style={{ backgroundColor: '#FF6B35' }}
                        initial={{ height: 0 }}
                        animate={isInView ? { height: '100%' } : {}}
                        transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
                    />

                    <div className="space-y-6 pl-4 sm:pl-6">
                        {paragraphs.map((text, i) => (
                            <motion.p
                                key={i}
                                className="text-base md:text-lg leading-relaxed"
                                style={{ fontFamily: "'Syne', sans-serif", color: '#4A4A6A', letterSpacing: '-0.02em', fontWeight: 500 }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ delay: 0.4 + i * 0.2, duration: 0.6 }}
                            >
                                {text}
                            </motion.p>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default About
