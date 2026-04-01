import { motion } from 'framer-motion'

const ContextSection = ({ context }) => {
    if (!context) return null

    return (
        <motion.div
            className="mt-6 mb-8"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
        >
            <div
                className="pl-5 max-w-2xl"
                style={{ borderLeft: '3px solid #FF6B35' }}
            >
                <p
                    className="text-xs font-semibold tracking-widest uppercase mb-3"
                    style={{ fontFamily: "'DM Mono', monospace", color: '#FF6B35' }}
                >
                    Background & Context
                </p>
                <p
                    className="text-base leading-relaxed"
                    style={{ fontFamily: "'Inter', sans-serif", color: '#4A4A6A' }}
                >
                    {context}
                </p>
            </div>
        </motion.div>
    )
}

export default ContextSection
