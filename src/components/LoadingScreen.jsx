import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const LoadingScreen = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(() => onComplete?.(), 600)
        }, 2000)
        return () => clearTimeout(timer)
    }, [onComplete])

    const pathVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 1.5, ease: 'easeInOut' }
        }
    }

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
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <svg width="120" height="80" viewBox="0 0 120 80">
                            <motion.text
                                x="50%"
                                y="50%"
                                dominantBaseline="central"
                                textAnchor="middle"
                                fill="none"
                                stroke="#FF6B35"
                                strokeWidth="1.5"
                                fontSize="48"
                                fontFamily="'Space Grotesk', sans-serif"
                                fontWeight="700"
                                variants={pathVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                SC
                            </motion.text>
                            <motion.text
                                x="50%"
                                y="50%"
                                dominantBaseline="central"
                                textAnchor="middle"
                                fill="#FF6B35"
                                fontSize="48"
                                fontFamily="'Space Grotesk', sans-serif"
                                fontWeight="700"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1, duration: 0.8 }}
                            >
                                SC
                            </motion.text>
                        </svg>
                        <motion.div
                            className="w-16 h-0.5 rounded-full"
                            style={{ backgroundColor: '#FF6B35' }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.5, duration: 1, ease: 'easeInOut' }}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default LoadingScreen
