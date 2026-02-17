import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, ChevronUp, Pencil, Trash2, GripVertical, Upload, Link as LinkIcon } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { supabaseFrom, supabaseStorage } from '../lib/supabase'

const projectTypes = [
    'PRD', 'Product Improvement', 'MVP PRD', 'Wireframes',
    'Data Analysis', 'Market Case Study', 'Teardown', 'Other',
]

const Toast = ({ message, onClose }) => (
    <motion.div
        className="fixed bottom-8 right-8 px-6 py-3 rounded-xl text-sm font-medium text-white shadow-lg z-[100]"
        style={{ backgroundColor: '#2D6A4F' }}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onAnimationComplete={() => setTimeout(onClose, 2500)}
    >
        {message}
    </motion.div>
)

const AdminPanel = ({ isOpen, onClose }) => {
    const [state, setState] = useState('closed') // closed | password_prompt | admin_open
    const [password, setPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [shake, setShake] = useState(false)

    // Resume state
    const [resumeOpen, setResumeOpen] = useState(true)
    const [resumeData, setResumeData] = useState(null)
    const [resumeLoading, setResumeLoading] = useState(false)

    // Projects state
    const [projects, setProjects] = useState([])
    const [projectsLoading, setProjectsLoading] = useState(false)
    const [editingProject, setEditingProject] = useState(null) // null | 'new' | project object
    const [confirmDelete, setConfirmDelete] = useState(null)

    // Form state
    const [form, setForm] = useState({ title: '', type: 'PRD', description: '', pdf_url: '' })
    const [pdfTab, setPdfTab] = useState('upload') // upload | url
    const [uploading, setUploading] = useState(false)


    // Toast
    const [toast, setToast] = useState('')

    useEffect(() => {
        if (isOpen) {
            setState('password_prompt')
        } else {
            setState('closed')
        }
    }, [isOpen])

    const fetchResume = useCallback(async () => {
        try {
            const { data } = await supabaseFrom('resume').select('*').limit(1).maybeSingle()
            setResumeData(data || null)
        } catch {
            setResumeData(null)
        }
    }, [])

    const fetchProjects = useCallback(async () => {
        setProjectsLoading(true)
        try {
            const { data } = await supabaseFrom('projects')
                .select('*')
                .order('order_index', { ascending: true })
            setProjects(data || [])
        } catch {
            setProjects([])
        } finally {
            setProjectsLoading(false)
        }
    }, [])

    const handleLogin = async () => {
        try {
            const { data, error } = await supabaseFrom('admin_settings')
                .select('password')
                .single()

            if (error || !data) {
                setPasswordError('Unable to verify. Check Supabase config.')
                return
            }

            if (data.password === password) {
                setState('admin_open')
                setPassword('')
                setPasswordError('')
                fetchResume()
                fetchProjects()
            } else {
                setPasswordError('Incorrect password')
                setShake(true)
                setTimeout(() => setShake(false), 500)
            }
        } catch {
            setPasswordError('Connection error')
        }
    }

    const handleLogout = () => {
        setState('closed')
        setPassword('')
        setPasswordError('')
        onClose()
    }

    // Resume upload (file-based via Supabase Storage)
    const handleResumeUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setResumeLoading(true)
        try {
            const { error: uploadError } = await supabaseStorage('resume')
                .upload('resume.pdf', file, { upsert: true })
            if (uploadError) throw uploadError

            const { data: urlData } = supabaseStorage('resume').getPublicUrl('resume.pdf')
            const publicUrl = urlData.publicUrl

            await supabaseFrom('resume').upsert({
                id: 1,
                file_url: publicUrl,
                updated_at: new Date().toISOString(),
            })
            setResumeData({ file_url: publicUrl, updated_at: new Date().toISOString() })
            setToast('Resume uploaded!')
        } catch (err) {
            setToast('Upload failed: ' + err.message)
        } finally {
            setResumeLoading(false)
        }
    }

    // Resume save (URL-based)
    const handleResumeSave = async (url) => {
        if (!url.trim()) return
        setResumeLoading(true)
        try {
            await supabaseFrom('resume').upsert({
                id: 1,
                file_url: url.trim(),
                updated_at: new Date().toISOString(),
            })
            setResumeData({ file_url: url.trim(), updated_at: new Date().toISOString() })
            setToast('Resume URL saved!')
        } catch (err) {
            setToast('Save failed: ' + err.message)
        } finally {
            setResumeLoading(false)
        }
    }

    // Project form handlers
    const openAddForm = () => {
        setEditingProject('new')
        setForm({ title: '', type: 'PRD', description: '', pdf_url: '' })
        setPdfTab('upload')
    }

    const openEditForm = (project) => {
        setEditingProject(project)
        setForm({
            title: project.title || '',
            type: project.type || 'PRD',
            description: project.description || '',
            pdf_url: project.pdf_url || '',
        })
        setPdfTab(project.pdf_url ? 'url' : 'upload')
    }

    const handleProjectPdfUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const filename = `${Date.now()}-${form.title || 'project'}.pdf`
            const { error } = await supabaseStorage('projects')
                .upload(filename, file, { upsert: true })
            if (error) throw error
            const { data: urlData } = supabaseStorage('projects').getPublicUrl(filename)
            setForm((f) => ({ ...f, pdf_url: urlData.publicUrl }))
            setToast('PDF uploaded!')
        } catch (err) {
            setToast('Upload failed: ' + err.message)
        } finally {
            setUploading(false)
        }
    }

    const handleSaveProject = async () => {
        if (!form.title.trim()) return
        try {
            if (editingProject === 'new') {
                const maxOrder = projects.length > 0 ? Math.max(...projects.map((p) => p.order_index || 0)) : 0
                const { data, error } = await supabaseFrom('projects')
                    .insert({
                        title: form.title,
                        type: form.type,
                        description: form.description,
                        pdf_url: form.pdf_url || null,
                        order_index: maxOrder + 1,
                    })
                    .select()
                    .single()
                if (error) throw error
                setProjects((prev) => [...prev, data])
                setToast('Project added!')
            } else {
                const { error } = await supabaseFrom('projects')
                    .update({
                        title: form.title,
                        type: form.type,
                        description: form.description,
                        pdf_url: form.pdf_url || null,
                    })
                    .eq('id', editingProject.id)
                if (error) throw error
                setProjects((prev) =>
                    prev.map((p) =>
                        p.id === editingProject.id
                            ? { ...p, title: form.title, type: form.type, description: form.description, pdf_url: form.pdf_url }
                            : p
                    )
                )
                setToast('Project updated!')
            }
            setEditingProject(null)
        } catch (err) {
            setToast('Save failed: ' + err.message)
        }
    }

    const handleDeleteProject = async (projectId) => {
        try {
            const { error } = await supabaseFrom('projects').delete().eq('id', projectId)
            if (error) throw error
            setProjects((prev) => prev.filter((p) => p.id !== projectId))
            setConfirmDelete(null)
            setToast('Project deleted')
        } catch (err) {
            setToast('Delete failed: ' + err.message)
        }
    }

    const handleDragEnd = async (result) => {
        if (!result.destination) return
        const items = Array.from(projects)
        const [reordered] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reordered)
        setProjects(items)

        // Update order in Supabase
        for (let i = 0; i < items.length; i++) {
            await supabaseFrom('projects')
                .update({ order_index: i + 1 })
                .eq('id', items[i].id)
        }
    }

    // Don't render if closed
    if (state === 'closed') return null

    return (
        <>
            {/* Password Prompt */}
            <AnimatePresence>
                {state === 'password_prompt' && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleLogout} />
                        <motion.div
                            className="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl z-10"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={shake ? { x: [0, -10, 10, -10, 10, 0], scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: shake ? 0.4 : 0.3 }}
                        >
                            <h3
                                className="text-xl font-bold mb-1"
                                style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}
                            >
                                Admin Access
                            </h3>
                            <p className="text-sm mb-6" style={{ color: '#4A4A6A' }}>
                                Enter your password to manage content
                            </p>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                placeholder="Password"
                                className="w-full px-4 py-3 rounded-xl border text-sm mb-3 outline-none transition-colors"
                                style={{
                                    borderColor: passwordError ? '#EF4444' : '#E5E3DF',
                                    fontFamily: "'Inter', sans-serif",
                                }}
                                onFocus={(e) => { e.target.style.borderColor = passwordError ? '#EF4444' : '#FF6B35' }}
                                onBlur={(e) => { e.target.style.borderColor = passwordError ? '#EF4444' : '#E5E3DF' }}
                                autoFocus
                            />
                            {passwordError && (
                                <p className="text-xs text-red-500 mb-3">{passwordError}</p>
                            )}
                            <button
                                onClick={handleLogin}
                                className="w-full py-3 rounded-xl text-sm font-medium text-white transition-colors"
                                style={{ backgroundColor: '#FF6B35' }}
                            >
                                Enter
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Admin Panel */}
            <AnimatePresence>
                {state === 'admin_open' && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/30 z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleLogout}
                        />
                        <motion.div
                            className="fixed right-0 top-0 h-screen bg-white shadow-2xl z-50 overflow-y-auto"
                            style={{ width: '420px', maxWidth: '100vw' }}
                            initial={{ x: 420 }}
                            animate={{ x: 0 }}
                            exit={{ x: 420 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            {/* Panel Header */}
                            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E3DF' }}>
                                <h2
                                    className="text-lg font-bold"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}
                                >
                                    Admin Panel
                                </h2>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm px-3 py-1 rounded-lg border transition-colors hover:bg-gray-50"
                                    style={{ color: '#4A4A6A', borderColor: '#E5E3DF' }}
                                >
                                    Logout
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* SECTION 1: Resume */}
                                <div className="border rounded-xl overflow-hidden" style={{ borderColor: '#E5E3DF' }}>
                                    <button
                                        onClick={() => setResumeOpen(!resumeOpen)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}>
                                            Resume
                                        </span>
                                        {resumeOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                    <AnimatePresence>
                                        {resumeOpen && (
                                            <motion.div
                                                className="px-4 pb-4 space-y-3"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <p className="text-xs" style={{ color: '#4A4A6A' }}>
                                                    {resumeData?.updated_at
                                                        ? `Last updated: ${new Date(resumeData.updated_at).toLocaleDateString()}`
                                                        : 'No resume uploaded yet'}
                                                </p>
                                                <label
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white w-full justify-center transition-colors"
                                                    style={{ backgroundColor: '#FF6B35', cursor: resumeLoading ? 'wait' : 'pointer' }}
                                                >
                                                    <Upload size={16} />
                                                    {resumeLoading ? 'Uploading...' : 'Upload Resume PDF'}
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        className="hidden"
                                                        onChange={handleResumeUpload}
                                                        disabled={resumeLoading}
                                                    />
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-px" style={{ backgroundColor: '#E5E3DF' }} />
                                                    <span className="text-xs" style={{ color: '#4A4A6A' }}>or paste URL</span>
                                                    <div className="flex-1 h-px" style={{ backgroundColor: '#E5E3DF' }} />
                                                </div>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        defaultValue={resumeData?.file_url || ''}
                                                        placeholder="Paste resume URL..."
                                                        className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#FF6B35]"
                                                        style={{ borderColor: '#E5E3DF' }}
                                                        id="resume-url-input"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const url = document.getElementById('resume-url-input')?.value
                                                            handleResumeSave(url)
                                                        }}
                                                        className="px-3 py-2 rounded-lg text-sm font-medium text-white"
                                                        style={{ backgroundColor: '#FF6B35' }}
                                                        disabled={resumeLoading}
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                                {resumeData?.file_url && (
                                                    <a
                                                        href={resumeData.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block text-center text-xs font-medium py-2"
                                                        style={{ color: '#FF6B35' }}
                                                    >
                                                        View Current Resume →
                                                    </a>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* SECTION 2: Projects */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3
                                            className="text-sm font-semibold"
                                            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}
                                        >
                                            Projects ({projects.length})
                                        </h3>
                                        <button
                                            onClick={openAddForm}
                                            className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                                            style={{ backgroundColor: '#FF6B35' }}
                                        >
                                            + Add New
                                        </button>
                                    </div>

                                    {/* Add / Edit Form */}
                                    <AnimatePresence>
                                        {editingProject && (
                                            <motion.div
                                                className="mb-4 p-4 border rounded-xl space-y-3"
                                                style={{ borderColor: '#E5E3DF' }}
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                <input
                                                    type="text"
                                                    value={form.title}
                                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                                    placeholder="Project title"
                                                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#FF6B35]"
                                                    style={{ borderColor: '#E5E3DF' }}
                                                />
                                                <select
                                                    value={form.type}
                                                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#FF6B35]"
                                                    style={{ borderColor: '#E5E3DF' }}
                                                >
                                                    {projectTypes.map((t) => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                                <textarea
                                                    value={form.description}
                                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                                    placeholder="Brief description of this project..."
                                                    rows={4}
                                                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none focus:border-[#FF6B35]"
                                                    style={{ borderColor: '#E5E3DF' }}
                                                />

                                                {/* PDF: Upload or URL */}
                                                <div className="flex gap-2 mb-2">
                                                    <button
                                                        onClick={() => setPdfTab('upload')}
                                                        className="text-xs px-3 py-1 rounded-lg font-medium border transition-colors"
                                                        style={{
                                                            backgroundColor: pdfTab === 'upload' ? '#FF6B35' : 'transparent',
                                                            color: pdfTab === 'upload' ? '#fff' : '#4A4A6A',
                                                            borderColor: pdfTab === 'upload' ? '#FF6B35' : '#E5E3DF',
                                                        }}
                                                    >
                                                        <Upload size={12} className="inline mr-1" />
                                                        Upload File
                                                    </button>
                                                    <button
                                                        onClick={() => setPdfTab('url')}
                                                        className="text-xs px-3 py-1 rounded-lg font-medium border transition-colors"
                                                        style={{
                                                            backgroundColor: pdfTab === 'url' ? '#FF6B35' : 'transparent',
                                                            color: pdfTab === 'url' ? '#fff' : '#4A4A6A',
                                                            borderColor: pdfTab === 'url' ? '#FF6B35' : '#E5E3DF',
                                                        }}
                                                    >
                                                        <LinkIcon size={12} className="inline mr-1" />
                                                        Paste URL
                                                    </button>
                                                </div>
                                                {pdfTab === 'upload' ? (
                                                    <label className="block">
                                                        <span className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs hover:bg-gray-50 transition-colors"
                                                            style={{ borderColor: '#E5E3DF', color: '#4A4A6A', cursor: 'pointer' }}
                                                        >
                                                            <Upload size={14} />
                                                            {uploading ? 'Uploading...' : 'Choose PDF file'}
                                                        </span>
                                                        <input
                                                            type="file"
                                                            accept=".pdf"
                                                            className="hidden"
                                                            onChange={handleProjectPdfUpload}
                                                            disabled={uploading}
                                                        />
                                                    </label>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={form.pdf_url}
                                                        onChange={(e) => setForm((f) => ({ ...f, pdf_url: e.target.value }))}
                                                        placeholder="https://..."
                                                        className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#FF6B35]"
                                                        style={{ borderColor: '#E5E3DF' }}
                                                    />
                                                )}
                                                {form.pdf_url && (
                                                    <p className="text-xs truncate" style={{ color: '#2D6A4F' }}>
                                                        ✓ {form.pdf_url}
                                                    </p>
                                                )}

                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={handleSaveProject}
                                                        className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                                                        style={{ backgroundColor: '#FF6B35' }}
                                                    >
                                                        Save Project
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingProject(null)}
                                                        className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50"
                                                        style={{ color: '#4A4A6A', borderColor: '#E5E3DF' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Project List */}
                                    {projectsLoading ? (
                                        <div className="py-8 text-center">
                                            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#FF6B35', borderTopColor: 'transparent' }} />
                                        </div>
                                    ) : projects.length === 0 ? (
                                        <p className="text-sm text-center py-8" style={{ color: '#4A4A6A' }}>
                                            No projects yet. Add your first project above.
                                        </p>
                                    ) : (
                                        <DragDropContext onDragEnd={handleDragEnd}>
                                            <Droppable droppableId="projects">
                                                {(provided) => (
                                                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                                                        {projects.map((project, index) => (
                                                            <Draggable key={project.id} draggableId={String(project.id)} index={index}>
                                                                {(provided, snapshot) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        className="flex items-center gap-2 p-3 rounded-xl border transition-colors"
                                                                        style={{
                                                                            borderColor: snapshot.isDragging ? '#FF6B35' : '#E5E3DF',
                                                                            backgroundColor: snapshot.isDragging ? '#FFF0EA' : '#FFFFFF',
                                                                            ...provided.draggableProps.style,
                                                                        }}
                                                                    >
                                                                        <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600">
                                                                            <GripVertical size={16} />
                                                                        </div>
                                                                        <span className="flex-1 text-sm font-medium truncate" style={{ color: '#1A1A2E' }}>
                                                                            {project.title}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => openEditForm(project)}
                                                                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                                                            style={{ color: '#4A4A6A' }}
                                                                        >
                                                                            <Pencil size={14} />
                                                                        </button>
                                                                        <div className="relative">
                                                                            <button
                                                                                onClick={() => setConfirmDelete(confirmDelete === project.id ? null : project.id)}
                                                                                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                                                style={{ color: '#EF4444' }}
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                            {confirmDelete === project.id && (
                                                                                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-2 z-10 whitespace-nowrap" style={{ borderColor: '#E5E3DF' }}>
                                                                                    <p className="text-xs mb-1" style={{ color: '#4A4A6A' }}>Delete this project?</p>
                                                                                    <button
                                                                                        onClick={() => handleDeleteProject(project.id)}
                                                                                        className="text-xs px-2 py-1 rounded bg-red-500 text-white mr-1"
                                                                                    >
                                                                                        Yes
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => setConfirmDelete(null)}
                                                                                        className="text-xs px-2 py-1 rounded border"
                                                                                        style={{ borderColor: '#E5E3DF' }}
                                                                                    >
                                                                                        No
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </DragDropContext>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && <Toast message={toast} onClose={() => setToast('')} />}
            </AnimatePresence>
        </>
    )
}

export default AdminPanel
