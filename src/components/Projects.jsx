import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import { supabaseFrom } from '../lib/supabase'
import ProjectCard from './ProjectCard'

const Projects = () => {
    const [problems, setProblems] = useState([])
    const [docCounts, setDocCounts] = useState({}) // { problemId: count }
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState(null)
    const sectionRef = useRef(null)
    const isInView = useInView(sectionRef, { once: true, margin: '-50px' })

    useEffect(() => {
        fetchProblems()
    }, [])

    const fetchProblems = async () => {
        try {
            const { data, error } = await supabaseFrom('problems')
                .select('*')
                .order('order_index', { ascending: true })

            if (error) throw error
            const list = (data || []).filter(
                (p) => !p.status || p.status === 'published'
            )
            setProblems(list)

            // Batch-load doc counts
            if (list.length > 0) {
                const ids = list.map((p) => p.id)
                const { data: docs } = await supabaseFrom('documents')
                    .select('problem_id')
                    .in('problem_id', ids)

                const counts = {}
                ;(docs || []).forEach(({ problem_id }) => {
                    counts[problem_id] = (counts[problem_id] || 0) + 1
                })
                setDocCounts(counts)
            }
        } catch (err) {
            console.error('Error fetching problems:', err)
            setProblems([])
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = useCallback((problemId) => {
        setExpandedId((prev) => {
            const next = prev === problemId ? null : problemId
            // Auto-scroll to the expanded card after a tick (let layout settle)
            if (next) {
                setTimeout(() => {
                    const el = document.getElementById(`problem-${next}`)
                    if (el) {
                        const top = el.getBoundingClientRect().top + window.scrollY - 80
                        window.scrollTo({ top, behavior: 'smooth' })
                    }
                }, 100)
            }
            return next
        })
    }, [])

    return (
        <section
            id="projects"
            ref={sectionRef}
            className="py-24 md:py-32 px-6"
            style={{ backgroundColor: '#F2F1EE' }}
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
                        02 / WORK
                    </p>
                    <h2
                        className="text-4xl md:text-5xl font-bold mb-3"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}
                    >
                        My Work
                    </h2>
                    <p
                        className="text-base md:text-lg max-w-xl"
                        style={{ fontFamily: "'Inter', sans-serif", color: '#4A4A6A' }}
                    >
                        Each problem I've tackled — research, strategy, and execution.
                    </p>
                </motion.div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="rounded-2xl h-80 skeleton-shimmer"
                                style={{ border: '1px solid #E5E3DF' }}
                            />
                        ))}
                    </div>
                ) : problems.length === 0 ? (
                    <motion.div
                        className="text-center py-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p
                            className="text-xl font-medium mb-2"
                            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}
                        >
                            Case studies coming soon
                        </p>
                        <p
                            className="text-sm"
                            style={{ fontFamily: "'Inter', sans-serif", color: '#4A4A6A' }}
                        >
                            Check back soon for in-depth product stories.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {problems.map((problem, index) => (
                            <div
                                key={problem.id}
                                id={`problem-${problem.id}`}
                                className={isExpanded(problem.id, expandedId) ? 'md:col-span-2' : ''}
                            >
                                <ProjectCard
                                    project={problem}
                                    index={index}
                                    isExpanded={expandedId === problem.id}
                                    onToggle={() => handleToggle(problem.id)}
                                    documentCount={docCounts[problem.id] || 0}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

// When expanded, the card spans both columns for full-width content
function isExpanded(id, expandedId) {
    return expandedId === id
}

export default Projects
