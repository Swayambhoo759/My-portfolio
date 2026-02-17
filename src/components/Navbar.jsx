import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Menu, X } from 'lucide-react'

const navLinks = [
    { label: 'Home', href: '#top' },
    { label: 'About', href: '#about' },
    { label: 'Work', href: '#projects' },
    { label: 'Skills', href: '#skills' },
    { label: 'Contact', href: '#contact' },
]

const Navbar = ({ onAdminClick }) => {
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleNavClick = (e, href) => {
        e.preventDefault()
        setMobileOpen(false)
        if (href === '#top') {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            const el = document.querySelector(href)
            if (el) el.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <>
            {/* ── Desktop Sidebar ── */}
            <motion.aside
                className="fixed left-0 top-0 bottom-0 z-50 hidden md:flex flex-col"
                style={{
                    width: '220px',
                    backgroundColor: '#1A1A2E',
                    padding: '40px 28px',
                }}
                initial={{ x: -220 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.6, delay: 2.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                {/* Logo + role */}
                <a
                    href="#top"
                    onClick={(e) => handleNavClick(e, '#top')}
                    className="block mb-1"
                >
                    <span
                        className="text-2xl font-semibold"
                        style={{ fontFamily: "'DM Mono', monospace", color: '#FF6B35' }}
                    >
                        SC
                    </span>
                </a>
                <p
                    className="text-xs mb-10"
                    style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(250,250,248,0.35)' }}
                >
                    Product Manager
                </p>

                {/* Nav links */}
                <nav className="flex flex-col gap-1">
                    {navLinks.map(({ label, href }) => (
                        <a
                            key={label}
                            href={href}
                            onClick={(e) => handleNavClick(e, href)}
                            className="text-sm font-medium px-3 py-2.5 rounded-lg transition-all duration-200 hover:text-white"
                            style={{
                                fontFamily: "'Inter', sans-serif",
                                color: 'rgba(250,250,248,0.45)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'
                                e.currentTarget.style.color = '#FAFAF8'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                                e.currentTarget.style.color = 'rgba(250,250,248,0.45)'
                            }}
                        >
                            {label}
                        </a>
                    ))}
                </nav>

                {/* Footer */}
                <div className="mt-auto">
                    <div className="mb-4" style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
                    <div className="flex items-center gap-4">
                        <a
                            href="https://www.linkedin.com/in/swayambhoo-jathraik"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs transition-colors duration-200 hover:text-[#FF6B35]"
                            style={{ fontFamily: "'DM Mono', monospace", color: 'rgba(250,250,248,0.3)' }}
                        >
                            LinkedIn
                        </a>
                        <a
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=swayam759@gmail.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs transition-colors duration-200 hover:text-[#FF6B35]"
                            style={{ fontFamily: "'DM Mono', monospace", color: 'rgba(250,250,248,0.3)' }}
                        >
                            Email
                        </a>
                        <button
                            onClick={onAdminClick}
                            className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-200"
                            style={{
                                borderColor: 'rgba(255,255,255,0.08)',
                                color: 'rgba(250,250,248,0.3)',
                                backgroundColor: 'transparent',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,107,53,0.3)'
                                e.currentTarget.style.color = '#FF6B35'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                                e.currentTarget.style.color = 'rgba(250,250,248,0.3)'
                            }}
                            aria-label="Admin"
                        >
                            <Lock size={14} />
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* ── Mobile Top Bar ── */}
            <motion.div
                className="fixed top-0 left-0 right-0 z-50 md:hidden flex items-center justify-between px-5 py-4"
                style={{ backgroundColor: '#1A1A2E' }}
                initial={{ y: -60 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, delay: 2.2 }}
            >
                <a
                    href="#top"
                    onClick={(e) => handleNavClick(e, '#top')}
                >
                    <span
                        className="text-xl font-semibold"
                        style={{ fontFamily: "'DM Mono', monospace", color: '#FF6B35' }}
                    >
                        SC
                    </span>
                </a>
                <button
                    onClick={() => setMobileOpen(true)}
                    style={{ color: '#FAFAF8' }}
                    aria-label="Menu"
                >
                    <Menu size={24} />
                </button>
            </motion.div>

            {/* ── Mobile Fullscreen Overlay ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        className="fixed inset-0 z-[60] flex flex-col items-center justify-center"
                        style={{ backgroundColor: '#1A1A2E' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-6 right-6 p-2"
                            style={{ color: '#FAFAF8' }}
                            aria-label="Close menu"
                        >
                            <X size={28} />
                        </button>
                        <nav className="flex flex-col items-center gap-8">
                            {navLinks.map(({ label, href }, index) => (
                                <motion.a
                                    key={label}
                                    href={href}
                                    onClick={(e) => handleNavClick(e, href)}
                                    className="text-4xl font-semibold"
                                    style={{
                                        fontFamily: "'Space Grotesk', sans-serif",
                                        color: '#FAFAF8',
                                    }}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.1 }}
                                    whileHover={{ color: '#FF6B35' }}
                                >
                                    {label}
                                </motion.a>
                            ))}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default Navbar
