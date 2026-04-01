import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const LoadingScreen = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(() => onComplete?.(), 600)
        }, 2400)
        return () => clearTimeout(timer)
    }, [onComplete])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    style={{ backgroundColor: '#1A1A2E' }}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col items-center">
                        {/* Main monogram */}
                        <div className="relative flex items-baseline gap-0.5">
                            {/* S */}
                            <motion.span
                                className="text-6xl tracking-tight"
                                style={{
                                    fontFamily: "'Playfair Display', Georgia, serif",
                                    fontStyle: 'italic',
                                    fontWeight: 300,
                                    color: '#FF6B35',
                                }}
                                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            >
                                S
                            </motion.span>

                            {/* Decorative dot */}
                            <motion.span
                                className="inline-block w-1.5 h-1.5 rounded-full mb-1"
                                style={{ backgroundColor: '#FF6B35' }}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 0.6 }}
                                transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
                            />

                            {/* C */}
                            <motion.span
                                className="text-6xl tracking-tight"
                                style={{
                                    fontFamily: "'Playfair Display', Georgia, serif",
                                    fontStyle: 'italic',
                                    fontWeight: 300,
                                    color: '#FF6B35',
                                }}
                                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            >
                                C
                            </motion.span>
                        </div>

                        {/* Elegant underline sweep */}
                        <motion.div
                            className="h-px rounded-full mt-3"
                            style={{ backgroundColor: 'rgba(255, 107, 53, 0.4)' }}
                            initial={{ width: 0 }}
                            animate={{ width: 72 }}
                            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        />

                        {/* Subtle tagline */}
                        <motion.p
                            className="text-xs tracking-[0.3em] uppercase mt-4"
                            style={{
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 300,
                                color: 'rgba(250, 250, 248, 0.25)',
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.0, duration: 0.8 }}
                        >
                            Product Manager
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default LoadingScreen
