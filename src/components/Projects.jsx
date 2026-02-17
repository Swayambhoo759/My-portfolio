import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { supabaseFrom } from '../lib/supabase'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'

const Projects = () => {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('All')
    const [selectedProject, setSelectedProject] = useState(null)
    const sectionRef = useRef(null)
    const isInView = useInView(sectionRef, { once: true, margin: '-50px' })

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabaseFrom('projects')
                .select('*')
                .order('order_index', { ascending: true })

            if (error) throw error
            setProjects(data || [])
        } catch (err) {
            console.error('Error fetching projects:', err)
            setProjects([])
        } finally {
            setLoading(false)
        }
    }

    const types = ['All', ...new Set(projects.map((p) => p.type).filter(Boolean))]
    const filtered = filter === 'All' ? projects : projects.filter((p) => p.type === filter)

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
                        className="text-base md:text-lg"
                        style={{ fontFamily: "'Inter', sans-serif", color: '#4A4A6A' }}
                    >
                        A collection of product thinking in action
                    </p>
                </motion.div>

                {/* Filter buttons */}
                {!loading && projects.length > 0 && (
                    <motion.div
                        className="flex flex-wrap gap-3 mb-10"
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        {types.map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className="px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300"
                                style={{
                                    fontFamily: "'DM Mono', monospace",
                                    backgroundColor: filter === type ? '#FF6B35' : '#FFFFFF',
                                    color: filter === type ? '#FFFFFF' : '#1A1A2E',
                                    borderColor: filter === type ? '#FF6B35' : '#E5E3DF',
                                }}
                            >
                                {type}
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="rounded-2xl p-6 h-64 skeleton-shimmer"
                                style={{ border: '1px solid #E5E3DF' }}
                            />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div
                        className="text-center py-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p
                            className="text-xl font-medium mb-2"
                            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}
                        >
                            Projects coming soon
                        </p>
                        <p
                            className="text-sm"
                            style={{ fontFamily: "'Inter', sans-serif", color: '#4A4A6A' }}
                        >
                            Check back soon for project case studies and teardowns.
                        </p>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={filter}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {filtered.map((project, index) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    index={index}
                                    onClick={setSelectedProject}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            {/* Modal */}
            <ProjectModal
                project={selectedProject}
                isOpen={!!selectedProject}
                onClose={() => setSelectedProject(null)}
            />
        </section>
    )
}

export default Projects
