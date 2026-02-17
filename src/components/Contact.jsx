import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Mail, Linkedin } from 'lucide-react'

const Contact = () => {
    const sectionRef = useRef(null)
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

    return (
        <section
            id="contact"
            ref={sectionRef}
            className="py-12 md:py-16 px-4 sm:px-6"
            style={{ backgroundColor: '#F5F1EB' }}
        >
            <div className="max-w-6xl mx-auto">
                {/* CTA Card — Concept A style */}
                <motion.div
                    className="rounded-3xl px-8 sm:px-12 md:px-16 py-14 sm:py-16 md:py-20 text-center overflow-hidden relative"
                    style={{
                        background: 'linear-gradient(135deg, #FF6B35 0%, #FF8F5E 50%, #FF6B35 100%)',
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                >
                    <motion.h2
                        className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#FFFFFF' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        Let&apos;s Build Something Together
                    </motion.h2>

                    <motion.p
                        className="text-base md:text-lg mb-10 max-w-lg mx-auto"
                        style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(255,255,255,0.85)' }}
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        Open to product roles, collaborations, and interesting problems.
                    </motion.p>

                    {/* Buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.6, duration: 0.6 }}
                    >
                        <motion.a
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=swayam759@gmail.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-medium"
                            style={{ backgroundColor: '#FFFFFF', color: '#FF6B35' }}
                            whileHover={{ y: -3, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <Mail size={18} />
                            Get In Touch
                        </motion.a>
                        <motion.a
                            href="https://www.linkedin.com/in/swayambhoo-jathraik"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-medium border-2"
                            style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#FFFFFF' }}
                            whileHover={{
                                y: -3,
                                backgroundColor: '#FFFFFF',
                                color: '#FF6B35',
                                borderColor: '#FFFFFF',
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <Linkedin size={18} />
                            Connect on LinkedIn
                        </motion.a>
                    </motion.div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    className="text-center mt-8 pb-4"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    <p
                        className="text-xs"
                        style={{
                            fontFamily: "'DM Mono', monospace",
                            color: 'rgba(74, 74, 106, 0.5)',
                        }}
                    >
                        © 2026 Swayambhoo Chauhan · Built with curiosity
                    </p>
                </motion.div>
            </div>
        </section>
    )
}

export default Contact
