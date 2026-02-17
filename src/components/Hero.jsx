import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { supabaseFrom } from '../lib/supabase'
import { useState } from 'react'

const skillBadges = ['Product Strategy', 'User Research', 'Data-Driven', 'Cross-Functional']

const stats = [
    { value: '12+', label: 'Products Shipped' },
    { value: '3x', label: 'Avg. Impact' },
    { value: '50K', label: 'Users Impacted' },
    { value: '4', label: 'Industries' },
]

/* ── Star layout: 5 nodes at star tips + Iterate at center ── */
const starLabels = ['Discover', 'Vision', 'Build', 'Prioritize', 'Ship']

/* Compute star tip positions using trigonometry.
   Center at (50, 50) in a 100×100 SVG viewBox, radius 38.
   Angles start at -90° (top) and go clockwise in 72° steps. */
const starRadius = 38
const starCx = 50
const starCy = 50
const starNodes = starLabels.map((label, i) => {
    const angle = ((-90 + i * 72) * Math.PI) / 180
    return {
        label,
        x: starCx + starRadius * Math.cos(angle),
        y: starCy + starRadius * Math.sin(angle),
    }
})

/* Star outline order: 0→2→4→1→3→0 (skip-one pattern creates the star shape) */
const starOrder = [0, 2, 4, 1, 3]
const starPoints = starOrder.map((i) => `${starNodes[i].x},${starNodes[i].y}`).join(' ')

const ProductFlow = () => (
    <div className="absolute inset-0 pointer-events-none hidden md:block">
        {/* Star SVG */}
        <svg
            className="absolute w-[340px] h-[340px]"
            style={{ right: '20px', top: '50%', transform: 'translateY(-50%)' }}
            viewBox="0 0 100 100"
            fill="none"
        >
            <defs>
                {/* Glow filter for star edges */}
                <filter id="starGlow">
                    <feGaussianBlur stdDeviation="0.8" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                {/* Radial gradient for center glow */}
                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(255,107,53,0.15)" />
                    <stop offset="100%" stopColor="rgba(255,107,53,0)" />
                </radialGradient>
            </defs>

            {/* Center glow disc */}
            <motion.circle
                cx={starCx}
                cy={starCy}
                r="12"
                fill="url(#centerGlow)"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
            />

            {/* Star outline (dashed, with glow) */}
            <motion.polygon
                points={starPoints}
                stroke="rgba(255,107,53,0.2)"
                strokeWidth="0.5"
                strokeDasharray="2 2"
                fill="none"
                filter="url(#starGlow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 1.5, duration: 2, ease: 'easeOut' }}
            />

            {/* Radial lines from center to each node */}
            {starNodes.map((node, i) => (
                <motion.line
                    key={`radial-${i}`}
                    x1={starCx}
                    y1={starCy}
                    x2={node.x}
                    y2={node.y}
                    stroke="rgba(255,107,53,0.1)"
                    strokeWidth="0.4"
                    strokeDasharray="1.5 2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 2 + i * 0.15, duration: 0.6 }}
                />
            ))}
        </svg>

        {/* Positioned container for nodes (same size/position as SVG) */}
        <div
            className="absolute w-[340px] h-[340px]"
            style={{ right: '20px', top: '50%', transform: 'translateY(-50%)' }}
        >
            {/* Star tip nodes — dot and label rendered separately so dot is always at the tip */}
            {starNodes.map((node, i) => {
                const pctX = (node.x / 100) * 100
                const pctY = (node.y / 100) * 100
                /* Compute label position: push label outward from center along the radial line */
                const dx = node.x - starCx
                const dy = node.y - starCy
                const len = Math.sqrt(dx * dx + dy * dy)
                const nudge = 6 // units in SVG coords to push the label outward
                const labelX = ((node.x + (dx / len) * nudge) / 100) * 100
                const labelY = ((node.y + (dy / len) * nudge) / 100) * 100
                /* Anchor label text toward the dot (right-side labels anchor left, etc.) */
                const isRight = node.x > starCx
                const isCenter = Math.abs(node.x - starCx) < 1
                let textAnchor = 'translate(-50%, -50%)' // default center
                if (isCenter) {
                    textAnchor = 'translate(-50%, 0)' // top node: center horizontally
                } else if (isRight) {
                    textAnchor = 'translate(0, -50%)' // right side: anchor left edge near dot
                } else {
                    textAnchor = 'translate(-100%, -50%)' // left side: anchor right edge near dot
                }
                return (
                    <div key={node.label}>
                        {/* Dot — always centered at the star tip */}
                        <motion.div
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                left: `${pctX}%`,
                                top: `${pctY}%`,
                                x: '-50%',
                                y: '-50%',
                                backgroundColor: '#FF6B35',
                                boxShadow: '0 0 8px rgba(255, 107, 53, 0.35)',
                            }}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: [1, 1.3, 1] }}
                            transition={{
                                opacity: { delay: 1.8 + i * 0.15, duration: 0.5 },
                                scale: { delay: 2.5 + i * 0.3, duration: 2, repeat: Infinity, ease: 'easeInOut' },
                            }}
                        />
                        {/* Label — pushed outward from dot along the radial direction */}
                        <motion.span
                            className="absolute text-[9px] tracking-[0.12em] uppercase whitespace-nowrap"
                            style={{
                                left: `${labelX}%`,
                                top: `${labelY}%`,
                                transform: textAnchor,
                                fontFamily: "'DM Mono', monospace",
                                color: 'rgba(250, 250, 248, 0.3)',
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2 + i * 0.15, duration: 0.5 }}
                        >
                            {node.label}
                        </motion.span>
                    </div>
                )
            })}



            {/* ✦ Iterate — center of the star */}
            <motion.div
                className="absolute flex items-center gap-2"
                style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.8, duration: 0.6, ease: 'easeOut' }}
            >
                <motion.div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{
                        background: 'linear-gradient(135deg, #FF6B35, #FFB347)',
                        boxShadow: '0 0 18px rgba(255, 107, 53, 0.45)',
                    }}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{
                        delay: 3.5,
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <span
                    className="text-[10px] tracking-[0.12em] uppercase whitespace-nowrap font-medium"
                    style={{
                        fontFamily: "'DM Mono', monospace",
                        color: 'rgba(255, 107, 53, 0.6)',
                    }}
                >
                    Iterate
                </span>
            </motion.div>
        </div>

        {/* Orbit rings */}
        <motion.div
            className="absolute rounded-full border"
            style={{
                width: '260px',
                height: '260px',
                right: '60px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderColor: 'rgba(255, 107, 53, 0.04)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
            className="absolute rounded-full border"
            style={{
                width: '180px',
                height: '180px',
                right: '100px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderColor: 'rgba(255, 255, 255, 0.025)',
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
    </div >
)

const Hero = () => {
    const [toastMsg, setToastMsg] = useState('')

    const handleResume = async () => {
        try {
            const { data, error } = await supabaseFrom('resume')
                .select('file_url')
                .limit(1)
                .maybeSingle()

            if (error || !data?.file_url) {
                setToastMsg('Resume coming soon')
                setTimeout(() => setToastMsg(''), 3000)
                return
            }
            window.open(data.file_url, '_blank')
        } catch {
            setToastMsg('Resume coming soon')
            setTimeout(() => setToastMsg(''), 3000)
        }
    }

    const scrollToProjects = (e) => {
        e.preventDefault()
        document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <section
            id="hero"
            className="px-4 sm:px-6 pt-6 pb-8"
            style={{ backgroundColor: '#F5F1EB' }}
        >
            <div className="max-w-6xl mx-auto space-y-5">
                {/* ── Main Hero Card ── */}
                <motion.div
                    className="relative rounded-3xl overflow-hidden px-8 sm:px-12 md:px-16 py-16 sm:py-20 md:py-24"
                    style={{
                        background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2B55 60%, #1A1A2E 100%)',
                        minHeight: '420px',
                    }}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    {/* Floating gradient orbs */}
                    <motion.div
                        className="absolute w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
                        style={{
                            background: 'radial-gradient(circle, #FF6B35 0%, transparent 70%)',
                            top: '10%',
                            right: '10%',
                        }}
                        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute w-60 h-60 rounded-full opacity-10 blur-3xl pointer-events-none"
                        style={{
                            background: 'radial-gradient(circle, #2D6A4F 0%, transparent 70%)',
                            bottom: '10%',
                            left: '5%',
                        }}
                        animate={{ y: [0, 15, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* ── Animated Product Flow (right side) ── */}
                    <ProductFlow />

                    <div className="relative z-10 max-w-xl">
                        <motion.h1
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05]"
                            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#FAFAF8' }}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                        >
                            I build products
                            <br />
                            that{' '}
                            <span style={{ color: '#FF6B35' }}>matter.</span>
                        </motion.h1>

                        <motion.p
                            className="mt-6 text-base sm:text-lg max-w-xl"
                            style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(250,250,248,0.6)' }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                        >
                            Swayambhoo Chauhan — Product Manager driven by V² thinking:
                            Value for users, Viability for business.
                        </motion.p>

                        {/* Skill Badges */}
                        <motion.div
                            className="mt-8 flex flex-wrap gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.6 }}
                        >
                            {skillBadges.map((badge) => (
                                <span
                                    key={badge}
                                    className="px-4 py-1.5 rounded-full text-xs font-medium border"
                                    style={{
                                        fontFamily: "'DM Mono', monospace",
                                        borderColor: 'rgba(250,250,248,0.2)',
                                        color: 'rgba(250,250,248,0.7)',
                                    }}
                                >
                                    {badge}
                                </span>
                            ))}
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            className="mt-10 flex flex-col sm:flex-row gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1, duration: 0.6 }}
                        >
                            <motion.a
                                href="#projects"
                                onClick={scrollToProjects}
                                className="px-8 py-4 rounded-full text-base font-medium text-white text-center"
                                style={{ backgroundColor: '#FF6B35' }}
                                whileHover={{ y: -3, backgroundColor: '#e55a2b' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                View My Work
                            </motion.a>
                            <motion.button
                                onClick={handleResume}
                                className="px-8 py-4 rounded-full text-base font-medium border-2 text-center"
                                style={{ borderColor: 'rgba(250,250,248,0.3)', color: '#FAFAF8', backgroundColor: 'transparent' }}
                                whileHover={{ y: -3, backgroundColor: 'rgba(250,250,248,0.1)' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                Download Resume
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ── Bento Row: About Card + Stats Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                    {/* About Card (larger) */}
                    <motion.div
                        className="lg:col-span-3 rounded-3xl p-8 sm:p-10 border"
                        style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DF' }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3, duration: 0.6 }}
                    >
                        <p
                            className="text-sm tracking-[0.15em] uppercase mb-3"
                            style={{ fontFamily: "'DM Mono', monospace", color: '#FF6B35' }}
                        >
                            About
                        </p>
                        <h2
                            className="text-2xl sm:text-3xl font-bold mb-4"
                            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}
                        >
                            From vision to shipped features
                        </h2>
                        <p
                            className="text-base leading-relaxed"
                            style={{ fontFamily: "'Inter', sans-serif", color: '#4A4A6A' }}
                        >
                            I thrive at the intersection of user needs and business outcomes. Every product
                            decision I make is filtered through V² thinking — does it deliver real Value to the
                            customer while ensuring Viability for the business?
                        </p>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div
                        className="lg:col-span-2 rounded-3xl border overflow-hidden grid grid-cols-2"
                        style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DF' }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.6 }}
                    >
                        {stats.map((stat, i) => (
                            <div
                                key={stat.label}
                                className="flex flex-col items-center justify-center p-6 sm:p-8"
                                style={{
                                    borderRight: i % 2 === 0 ? '1px solid #E5E3DF' : 'none',
                                    borderBottom: i < 2 ? '1px solid #E5E3DF' : 'none',
                                }}
                            >
                                <span
                                    className="text-3xl sm:text-4xl font-bold"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#FF6B35' }}
                                >
                                    {stat.value}
                                </span>
                                <span
                                    className="text-xs mt-1 text-center"
                                    style={{ fontFamily: "'Inter', sans-serif", color: '#4A4A6A' }}
                                >
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    className="flex flex-col items-center gap-2 pt-4 pb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 1.8, duration: 0.6 }}
                >
                    <span
                        className="text-xs tracking-widest uppercase"
                        style={{ fontFamily: "'DM Mono', monospace", color: '#FF6B35' }}
                    >
                        scroll
                    </span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    >
                        <ChevronDown size={20} color="#FF6B35" />
                    </motion.div>
                </motion.div>
            </div>

            {/* Toast */}
            {toastMsg && (
                <motion.div
                    className="fixed bottom-8 right-8 px-6 py-3 rounded-xl text-sm font-medium text-white shadow-lg z-[70]"
                    style={{ backgroundColor: '#1A1A2E' }}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                >
                    {toastMsg}
                </motion.div>
            )}
        </section>
    )
}

export default Hero
