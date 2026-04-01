import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X, ChevronDown, ChevronUp, Pencil, Trash2, GripVertical,
    Upload, Link as LinkIcon, ArrowLeft, Image, FileText
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { supabaseFrom, supabaseStorage } from '../lib/supabase'

// ── Constants ─────────────────────────────────────────────────────────────────
const documentTypes = [
    'Research Paper', 'PRD', 'MVP PRD', 'Product Improvement',
    'Wireframes', 'Data Analysis', 'Market Case Study', 'Teardown',
    'Case Study', 'Other',
]

// ── Toast ─────────────────────────────────────────────────────────────────────
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

// ── File-or-URL input ─────────────────────────────────────────────────────────
const FileOrUrl = ({ value, onChange, bucket, label = 'PDF', accept = '.pdf', uploading, setUploading, setToast }) => {
    const [tab, setTab] = useState(value ? 'url' : 'upload')

    const handleUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
            const { error } = await supabaseStorage(bucket).upload(filename, file, { upsert: true })
            if (error) throw error
            const { data: urlData } = supabaseStorage(bucket).getPublicUrl(filename)
            onChange(urlData.publicUrl)
            setToast(`${label} uploaded!`)
        } catch (err) {
            setToast('Upload failed: ' + err.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                {['upload', 'url'].map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        className="text-xs px-3 py-1 rounded-lg font-medium border transition-colors"
                        style={{
                            backgroundColor: tab === t ? '#FF6B35' : 'transparent',
                            color: tab === t ? '#fff' : '#4A4A6A',
                            borderColor: tab === t ? '#FF6B35' : '#E5E3DF',
                        }}
                    >
                        {t === 'upload' ? <><Upload size={11} className="inline mr-1" />Upload</> : <><LinkIcon size={11} className="inline mr-1" />URL</>}
                    </button>
                ))}
            </div>
            {tab === 'upload' ? (
                <label className="block cursor-pointer">
                    <span
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs hover:bg-gray-50 transition-colors"
                        style={{ borderColor: '#E5E3DF', color: '#4A4A6A' }}
                    >
                        <Upload size={13} />
                        {uploading ? 'Uploading…' : `Choose ${label} file`}
                    </span>
                    <input type="file" accept={accept} className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="https://…"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#FF6B35]"
                    style={{ borderColor: '#E5E3DF' }}
                />
            )}
            {value && (
                <p className="text-xs truncate" style={{ color: '#2D6A4F' }}>✓ {value}</p>
            )}
        </div>
    )
}

// ── Documents sub-panel ───────────────────────────────────────────────────────
const DocumentsPanel = ({ problem, onBack, setToast }) => {
    const [docs, setDocs] = useState([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(null) // null | 'new' | doc object
    const [form, setForm] = useState({ title: '', type: 'PRD', short_summary: '', pdf_url: '' })
    const [uploading, setUploading] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(null)

    const fetchDocs = useCallback(async () => {
        setLoading(true)
        const { data } = await supabaseFrom('documents')
            .select('*')
            .eq('problem_id', problem.id)
            .order('order_index', { ascending: true })
        setDocs(data || [])
        setLoading(false)
    }, [problem.id])

    useEffect(() => { fetchDocs() }, [fetchDocs])

    const openAdd = () => {
        setEditing('new')
        setForm({ title: '', type: 'PRD', short_summary: '', pdf_url: '' })
    }

    const openEdit = (doc) => {
        setEditing(doc)
        setForm({ title: doc.title || '', type: doc.type || 'PRD', short_summary: doc.short_summary || '', pdf_url: doc.pdf_url || '' })
    }

    const handleSave = async () => {
        if (!form.title.trim()) return
        try {
            if (editing === 'new') {
                const maxOrder = docs.length > 0 ? Math.max(...docs.map((d) => d.order_index || 0)) : 0
                const { data, error } = await supabaseFrom('documents')
                    .insert({
                        problem_id: problem.id,
                        title: form.title,
                        type: form.type,
                        short_summary: form.short_summary || null,
                        pdf_url: form.pdf_url || null,
                        order_index: maxOrder + 1,
                    })
                    .select().single()
                if (error) throw error
                setDocs((prev) => [...prev, data])
                setToast('Document added!')
            } else {
                const { error } = await supabaseFrom('documents')
                    .update({ title: form.title, type: form.type, short_summary: form.short_summary || null, pdf_url: form.pdf_url || null })
                    .eq('id', editing.id)
                if (error) throw error
                setDocs((prev) => prev.map((d) => d.id === editing.id ? { ...d, ...form } : d))
                setToast('Document updated!')
            }
            setEditing(null)
        } catch (err) {
            setToast('Save failed: ' + err.message)
        }
    }

    const handleDelete = async (id) => {
        const { error } = await supabaseFrom('documents').delete().eq('id', id)
        if (error) { setToast('Delete failed: ' + error.message); return }
        setDocs((prev) => prev.filter((d) => d.id !== id))
        setConfirmDelete(null)
        setToast('Document deleted')
    }

    const handleDragEnd = async (result) => {
        if (!result.destination) return
        const items = Array.from(docs)
        const [moved] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, moved)
        setDocs(items)
        for (let i = 0; i < items.length; i++) {
            await supabaseFrom('documents').update({ order_index: i + 1 }).eq('id', items[i].id)
        }
    }

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-xs font-medium hover:underline"
                style={{ color: '#4A4A6A' }}
            >
                <ArrowLeft size={13} /> Back to Problems
            </button>

            <div className="rounded-xl p-3" style={{ backgroundColor: '#FFF8F5', border: '1px solid #FFD4C2' }}>
                <p className="text-xs font-semibold" style={{ fontFamily: "'DM Mono', monospace", color: '#FF6B35' }}>Managing docs for:</p>
                <p className="text-sm font-semibold mt-0.5 line-clamp-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}>{problem.title}</p>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}>
                    Documents ({docs.length})
                </h3>
                <button
                    onClick={openAdd}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                    style={{ backgroundColor: '#FF6B35' }}
                >
                    + Add Doc
                </button>
            </div>

            {/* Form */}
            <AnimatePresence>
                {editing && (
                    <motion.div
                        className="p-4 border rounded-xl space-y-3"
                        style={{ borderColor: '#E5E3DF', overflow: 'visible' }}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                    >
                        <input
                            type="text" value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            placeholder="Document title"
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#FF6B35]"
                            style={{ borderColor: '#E5E3DF' }}
                        />
                        <select
                            value={form.type}
                            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#FF6B35]"
                            style={{ borderColor: '#E5E3DF' }}
                        >
                            {documentTypes.map((t) => <option key={t}>{t}</option>)}
                        </select>
                        <textarea
                            value={form.short_summary}
                            onChange={(e) => setForm((f) => ({ ...f, short_summary: e.target.value }))}
                            placeholder="Short summary of what this document contains…"
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none focus:border-[#FF6B35]"
                            style={{ borderColor: '#E5E3DF' }}
                        />
                        <FileOrUrl
                            value={form.pdf_url}
                            onChange={(url) => setForm((f) => ({ ...f, pdf_url: url }))}
                            bucket="projects"
                            label="PDF"
                            uploading={uploading}
                            setUploading={setUploading}
                            setToast={setToast}
                        />
                        <div className="flex gap-2 pt-1">
                            <button onClick={handleSave} className="flex-1 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: '#FF6B35' }}>
                                Save
                            </button>
                            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50" style={{ color: '#4A4A6A', borderColor: '#E5E3DF' }}>
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List */}
            {loading ? (
                <div className="py-8 flex justify-center">
                    <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FF6B35', borderTopColor: 'transparent' }} />
                </div>
            ) : docs.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: '#9CA3AF' }}>No documents yet. Add the first one above.</p>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="docs">
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                                {docs.map((doc, index) => (
                                    <Draggable key={doc.id} draggableId={String(doc.id)} index={index}>
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
                                                <div {...provided.dragHandleProps} className="text-gray-300 hover:text-gray-500">
                                                    <GripVertical size={15} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate" style={{ color: '#1A1A2E' }}>{doc.title}</p>
                                                    <p className="text-xs truncate" style={{ color: '#9CA3AF', fontFamily: "'DM Mono', monospace" }}>{doc.type}</p>
                                                </div>
                                                <button onClick={() => openEdit(doc)} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: '#4A4A6A' }}>
                                                    <Pencil size={13} />
                                                </button>
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setConfirmDelete(confirmDelete === doc.id ? null : doc.id)}
                                                        className="p-1.5 rounded-lg hover:bg-red-50"
                                                        style={{ color: '#EF4444' }}
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                    {confirmDelete === doc.id && (
                                                        <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-2 z-10 whitespace-nowrap" style={{ borderColor: '#E5E3DF' }}>
                                                            <p className="text-xs mb-1.5" style={{ color: '#4A4A6A' }}>Delete this doc?</p>
                                                            <button onClick={() => handleDelete(doc.id)} className="text-xs px-2 py-1 rounded bg-red-500 text-white mr-1">Yes</button>
                                                            <button onClick={() => setConfirmDelete(null)} className="text-xs px-2 py-1 rounded border" style={{ borderColor: '#E5E3DF' }}>No</button>
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
    )
}

// ── Main AdminPanel ───────────────────────────────────────────────────────────
const AdminPanel = ({ isOpen, onClose }) => {
    const [state, setState] = useState('closed') // closed | password_prompt | admin_open
    const [password, setPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [shake, setShake] = useState(false)

    // Resume
    const [resumeOpen, setResumeOpen] = useState(false)
    const [resumeData, setResumeData] = useState(null)
    const [resumeLoading, setResumeLoading] = useState(false)

    // Problems
    const [problems, setProblems] = useState([])
    const [problemsLoading, setProblemsLoading] = useState(false)
    const [editingProblem, setEditingProblem] = useState(null) // null | 'new' | problem
    const [activeProblem, setActiveProblem] = useState(null)  // problem whose docs we're managing
    const [problemForm, setProblemForm] = useState({
        title: '', problem_statement: '', context: '', key_metrics: '', key_learnings: '', next_steps: '',
        tags: '', thumbnail_url: '', status: 'published',
    })
    const [thumbnailUploading, setThumbnailUploading] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(null)

    const [toast, setToast] = useState('')

    useEffect(() => {
        if (isOpen) setState('password_prompt')
        else setState('closed')
    }, [isOpen])

    const fetchResume = useCallback(async () => {
        try {
            const { data } = await supabaseFrom('resume').select('*').limit(1).maybeSingle()
            setResumeData(data || null)
        } catch { setResumeData(null) }
    }, [])

    const fetchProblems = useCallback(async () => {
        setProblemsLoading(true)
        try {
            const { data } = await supabaseFrom('problems').select('*').order('order_index', { ascending: true })
            setProblems(data || [])
        } catch { setProblems([]) }
        finally { setProblemsLoading(false) }
    }, [])

    const handleLogin = async () => {
        try {
            const { data, error } = await supabaseFrom('admin_settings').select('password').single()
            if (error || !data) { setPasswordError('Unable to verify. Check Supabase config.'); return }
            if (data.password === password) {
                setState('admin_open'); setPassword(''); setPasswordError('')
                fetchResume(); fetchProblems()
            } else {
                setPasswordError('Incorrect password'); setShake(true)
                setTimeout(() => setShake(false), 500)
            }
        } catch { setPasswordError('Connection error') }
    }

    const handleLogout = () => { setState('closed'); setPassword(''); setPasswordError(''); onClose() }

    // Resume handlers
    const handleResumeUpload = async (e) => {
        const file = e.target.files?.[0]; if (!file) return
        setResumeLoading(true)
        try {
            const { error: uploadError } = await supabaseStorage('resume').upload('resume.pdf', file, { upsert: true })
            if (uploadError) throw uploadError
            const { data: urlData } = supabaseStorage('resume').getPublicUrl('resume.pdf')
            await supabaseFrom('resume').upsert({ id: 1, file_url: urlData.publicUrl, updated_at: new Date().toISOString() })
            setResumeData({ file_url: urlData.publicUrl, updated_at: new Date().toISOString() })
            setToast('Resume uploaded!')
        } catch (err) { setToast('Upload failed: ' + err.message) }
        finally { setResumeLoading(false) }
    }

    const handleResumeSave = async (url) => {
        if (!url.trim()) return
        setResumeLoading(true)
        try {
            await supabaseFrom('resume').upsert({ id: 1, file_url: url.trim(), updated_at: new Date().toISOString() })
            setResumeData({ file_url: url.trim(), updated_at: new Date().toISOString() })
            setToast('Resume URL saved!')
        } catch (err) { setToast('Save failed: ' + err.message) }
        finally { setResumeLoading(false) }
    }

    // Problem form handlers
    const openAddProblem = () => {
        setEditingProblem('new')
        setProblemForm({ title: '', problem_statement: '', context: '', key_metrics: '', key_learnings: '', next_steps: '', tags: '', thumbnail_url: '', status: 'published' })
    }

    const openEditProblem = (p) => {
        setEditingProblem(p)
        setProblemForm({
            title: p.title || '', problem_statement: p.problem_statement || '',
            context: p.context || '', key_metrics: p.key_metrics || '', key_learnings: p.key_learnings || '', next_steps: p.next_steps || '',
            tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
            thumbnail_url: p.thumbnail_url || '', status: p.status || 'published',
        })
    }

    const handleSaveProblem = async () => {
        if (!problemForm.title.trim()) return
        const tagsArray = problemForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
        const payload = {
            title: problemForm.title,
            problem_statement: problemForm.problem_statement,
            context: problemForm.context || null,
            key_metrics: problemForm.key_metrics || null,
            key_learnings: problemForm.key_learnings || null,
            next_steps: problemForm.next_steps || null,
            tags: tagsArray,
            thumbnail_url: problemForm.thumbnail_url || null,
            status: problemForm.status,
        }
        try {
            if (editingProblem === 'new') {
                const maxOrder = problems.length > 0 ? Math.max(...problems.map((p) => p.order_index || 0)) : 0
                const { data, error } = await supabaseFrom('problems')
                    .insert({ ...payload, order_index: maxOrder + 1 })
                    .select().single()
                if (error) throw error
                setProblems((prev) => [...prev, data])
                setEditingProblem(null)
                setToast('Problem saved! Now add your documents →')
                // Auto-navigate to Documents panel for the new problem
                setActiveProblem(data)
            } else {
                const { error } = await supabaseFrom('problems').update(payload).eq('id', editingProblem.id)
                if (error) throw error
                setProblems((prev) => prev.map((p) => p.id === editingProblem.id ? { ...p, ...payload } : p))
                setEditingProblem(null)
                setToast('Problem updated!')
            }
        } catch (err) { setToast('Save failed: ' + err.message) }
    }

    const handleDeleteProblem = async (id) => {
        try {
            const { error } = await supabaseFrom('problems').delete().eq('id', id)
            if (error) throw error
            setProblems((prev) => prev.filter((p) => p.id !== id))
            setConfirmDelete(null)
            setToast('Problem deleted (and all its documents)')
        } catch (err) { setToast('Delete failed: ' + err.message) }
    }

    const handleDragEnd = async (result) => {
        if (!result.destination) return
        const items = Array.from(problems)
        const [moved] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, moved)
        setProblems(items)
        for (let i = 0; i < items.length; i++) {
            await supabaseFrom('problems').update({ order_index: i + 1 }).eq('id', items[i].id)
        }
    }

    if (state === 'closed') return null

    return (
        <>
            {/* Password Prompt */}
            <AnimatePresence>
                {state === 'password_prompt' && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center px-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleLogout} />
                        <motion.div
                            className="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl z-10"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={shake ? { x: [0, -10, 10, -10, 10, 0], scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: shake ? 0.4 : 0.3 }}
                        >
                            <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}>Admin Access</h3>
                            <p className="text-sm mb-6" style={{ color: '#4A4A6A' }}>Enter your password to manage content</p>
                            <input
                                type="password" value={password}
                                onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                placeholder="Password"
                                className="w-full px-4 py-3 rounded-xl border text-sm mb-3 outline-none"
                                style={{ borderColor: passwordError ? '#EF4444' : '#E5E3DF' }}
                                onFocus={(e) => { e.target.style.borderColor = passwordError ? '#EF4444' : '#FF6B35' }}
                                onBlur={(e) => { e.target.style.borderColor = passwordError ? '#EF4444' : '#E5E3DF' }}
                                autoFocus
                            />
                            {passwordError && <p className="text-xs text-red-500 mb-3">{passwordError}</p>}
                            <button onClick={handleLogin} className="w-full py-3 rounded-xl text-sm font-medium text-white" style={{ backgroundColor: '#FF6B35' }}>
                                Enter
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Admin Panel Drawer */}
            <AnimatePresence>
                {state === 'admin_open' && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/30 z-40"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={handleLogout}
                        />
                        <motion.div
                            className="fixed right-0 top-0 h-screen bg-white shadow-2xl z-50 overflow-y-auto"
                            style={{ width: '440px', maxWidth: '100vw' }}
                            initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10" style={{ borderColor: '#E5E3DF' }}>
                                <h2 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}>
                                    {activeProblem ? 'Manage Documents' : 'Admin Panel'}
                                </h2>
                                <button onClick={handleLogout} className="text-sm px-3 py-1 rounded-lg border hover:bg-gray-50" style={{ color: '#4A4A6A', borderColor: '#E5E3DF' }}>
                                    Logout
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* ── LEVEL 2: Documents for a problem ── */}
                                {activeProblem ? (
                                    <DocumentsPanel
                                        problem={activeProblem}
                                        onBack={() => setActiveProblem(null)}
                                        setToast={setToast}
                                    />
                                ) : (
                                    <>
                                        {/* ── SECTION: Resume ── */}
                                        <div className="border rounded-xl overflow-hidden" style={{ borderColor: '#E5E3DF' }}>
                                            <button
                                                onClick={() => setResumeOpen(!resumeOpen)}
                                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}>Resume</span>
                                                {resumeOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                            <AnimatePresence>
                                                {resumeOpen && (
                                                    <motion.div
                                                        className="px-4 pb-4 space-y-3"
                                                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <p className="text-xs" style={{ color: '#4A4A6A' }}>
                                                            {resumeData?.updated_at
                                                                ? `Last updated: ${new Date(resumeData.updated_at).toLocaleDateString()}`
                                                                : 'No resume uploaded yet'}
                                                        </p>
                                                        <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white w-full justify-center cursor-pointer" style={{ backgroundColor: '#FF6B35' }}>
                                                            <Upload size={16} />
                                                            {resumeLoading ? 'Uploading...' : 'Upload Resume PDF'}
                                                            <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} disabled={resumeLoading} />
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-px" style={{ backgroundColor: '#E5E3DF' }} />
                                                            <span className="text-xs" style={{ color: '#4A4A6A' }}>or paste URL</span>
                                                            <div className="flex-1 h-px" style={{ backgroundColor: '#E5E3DF' }} />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text" defaultValue={resumeData?.file_url || ''} placeholder="Paste resume URL..."
                                                                className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#FF6B35]"
                                                                style={{ borderColor: '#E5E3DF' }} id="resume-url-input"
                                                            />
                                                            <button
                                                                onClick={() => handleResumeSave(document.getElementById('resume-url-input')?.value)}
                                                                className="px-3 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: '#FF6B35' }}
                                                                disabled={resumeLoading}
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                        {resumeData?.file_url && (
                                                            <a href={resumeData.file_url} target="_blank" rel="noopener noreferrer"
                                                                className="block text-center text-xs font-medium py-2" style={{ color: '#FF6B35' }}>
                                                                View Current Resume →
                                                            </a>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* ── SECTION: Problems ── */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}>
                                                    Problems / Case Studies ({problems.length})
                                                </h3>
                                                <button onClick={openAddProblem} className="text-xs px-3 py-1.5 rounded-lg font-medium text-white" style={{ backgroundColor: '#FF6B35' }}>
                                                    + Add New
                                                </button>
                                            </div>

                                            {/* Problem form */}
                                            <AnimatePresence>
                                                {editingProblem && (
                                                    <motion.div
                                                        className="mb-4 p-4 border rounded-xl space-y-3"
                                                        style={{ borderColor: '#E5E3DF', overflow: 'visible' }}
                                                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <input
                                                            type="text" value={problemForm.title}
                                                            onChange={(e) => setProblemForm((f) => ({ ...f, title: e.target.value }))}
                                                            placeholder='Title (e.g. "How can we help travelers plan better trips?")'
                                                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#FF6B35]"
                                                            style={{ borderColor: '#E5E3DF' }}
                                                        />
                                                        <textarea
                                                            value={problemForm.problem_statement}
                                                            onChange={(e) => setProblemForm((f) => ({ ...f, problem_statement: e.target.value }))}
                                                            placeholder="Problem statement (1–2 sentences shown on the card)…"
                                                            rows={2}
                                                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none focus:border-[#FF6B35]"
                                                            style={{ borderColor: '#E5E3DF' }}
                                                        />
                                                        <textarea
                                                            value={problemForm.context}
                                                            onChange={(e) => setProblemForm((f) => ({ ...f, context: e.target.value }))}
                                                            placeholder="Background & context (optional, shown in collapsible section)…"
                                                            rows={3}
                                                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none focus:border-[#FF6B35]"
                                                            style={{ borderColor: '#E5E3DF' }}
                                                        />
                                                        <textarea
                                                            value={problemForm.key_metrics}
                                                            onChange={(e) => setProblemForm((f) => ({ ...f, key_metrics: e.target.value }))}
                                                            placeholder="📊 Key Metrics (quantified results, numbers)…"
                                                            rows={2}
                                                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none focus:border-[#FF6B35]"
                                                            style={{ borderColor: '#E5E3DF' }}
                                                        />
                                                        <textarea
                                                            value={problemForm.key_learnings}
                                                            onChange={(e) => setProblemForm((f) => ({ ...f, key_learnings: e.target.value }))}
                                                            placeholder="💡 Key Learnings (insights, 'aha' moments)…"
                                                            rows={2}
                                                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none focus:border-[#FF6B35]"
                                                            style={{ borderColor: '#E5E3DF' }}
                                                        />
                                                        <textarea
                                                            value={problemForm.next_steps}
                                                            onChange={(e) => setProblemForm((f) => ({ ...f, next_steps: e.target.value }))}
                                                            placeholder="🔄 Next Steps (what I'd do differently)…"
                                                            rows={2}
                                                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none focus:border-[#FF6B35]"
                                                            style={{ borderColor: '#E5E3DF' }}
                                                        />
                                                        <input
                                                            type="text" value={problemForm.tags}
                                                            onChange={(e) => setProblemForm((f) => ({ ...f, tags: e.target.value }))}
                                                            placeholder="Tags (comma-separated: B2C, Travel, GenAI)"
                                                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#FF6B35]"
                                                            style={{ borderColor: '#E5E3DF' }}
                                                        />

                                                        {/* Thumbnail upload — card image only */}
                                                        <div>
                                                            <p className="text-xs font-medium mb-1.5" style={{ color: '#4A4A6A' }}>🖼️ Card Thumbnail <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(cover image for the tile)</span></p>
                                                            <FileOrUrl
                                                                value={problemForm.thumbnail_url}
                                                                onChange={(url) => setProblemForm((f) => ({ ...f, thumbnail_url: url }))}
                                                                bucket="thumbnails"
                                                                label="Image"
                                                                accept="image/*"
                                                                uploading={thumbnailUploading}
                                                                setUploading={setThumbnailUploading}
                                                                setToast={setToast}
                                                            />
                                                        </div>

                                                        {/* Status toggle */}
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-medium" style={{ color: '#4A4A6A' }}>Status:</span>
                                                            {['published', 'draft'].map((s) => (
                                                                <button
                                                                    key={s}
                                                                    type="button"
                                                                    onClick={() => setProblemForm((f) => ({ ...f, status: s }))}
                                                                    className="text-xs px-3 py-1 rounded-full font-medium border transition-colors capitalize"
                                                                    style={{
                                                                        backgroundColor: problemForm.status === s ? (s === 'published' ? '#DCFCE7' : '#FEF9C3') : 'transparent',
                                                                        color: problemForm.status === s ? (s === 'published' ? '#15803D' : '#A16207') : '#4A4A6A',
                                                                        borderColor: problemForm.status === s ? (s === 'published' ? '#BBF7D0' : '#FDE68A') : '#E5E3DF',
                                                                    }}
                                                                >
                                                                    {s}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {/* Info callout about documents */}
                                                        <div className="rounded-lg p-3" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                                                            <p className="text-xs leading-relaxed" style={{ color: '#1D4ED8' }}>
                                                                📄 <strong>Documents & PDFs</strong> (research papers, PRDs, wireframes) are added in the next step after saving this problem.
                                                            </p>
                                                        </div>

                                                        <div className="flex gap-2 pt-1">
                                                            <button onClick={handleSaveProblem} className="flex-1 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: '#FF6B35' }}>
                                                                Save Problem
                                                            </button>
                                                            <button onClick={() => setEditingProblem(null)} className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50" style={{ color: '#4A4A6A', borderColor: '#E5E3DF' }}>
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Problems list */}
                                            {problemsLoading ? (
                                                <div className="py-8 flex justify-center">
                                                    <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FF6B35', borderTopColor: 'transparent' }} />
                                                </div>
                                            ) : problems.length === 0 ? (
                                                <p className="text-sm text-center py-8" style={{ color: '#4A4A6A' }}>No problems yet. Add your first one above.</p>
                                            ) : (
                                                <DragDropContext onDragEnd={handleDragEnd}>
                                                    <Droppable droppableId="problems">
                                                        {(provided) => (
                                                            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                                                                {problems.map((problem, index) => (
                                                                    <Draggable key={problem.id} draggableId={String(problem.id)} index={index}>
                                                                        {(provided, snapshot) => (
                                                                            <div
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                className="border rounded-xl overflow-hidden transition-colors"
                                                                                style={{
                                                                                    borderColor: snapshot.isDragging ? '#FF6B35' : '#E5E3DF',
                                                                                    backgroundColor: snapshot.isDragging ? '#FFF0EA' : '#FFFFFF',
                                                                                    ...provided.draggableProps.style,
                                                                                }}
                                                                            >
                                                                                <div className="flex items-center gap-2 p-3">
                                                                                    <div {...provided.dragHandleProps} className="text-gray-300 hover:text-gray-500">
                                                                                        <GripVertical size={15} />
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                                                            <p className="text-sm font-medium truncate" style={{ color: '#1A1A2E' }}>{problem.title}</p>
                                                                                            {problem.status === 'draft' && (
                                                                                                <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#FEF9C3', color: '#A16207', fontFamily: "'DM Mono', monospace" }}>draft</span>
                                                                                            )}
                                                                                        </div>
                                                                                        <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>
                                                                                            {Array.isArray(problem.tags) && problem.tags.length > 0 ? problem.tags.join(', ') : 'No tags'}
                                                                                        </p>
                                                                                    </div>
                                                                                    {/* Manage docs */}
                                                                                    <button
                                                                                        onClick={() => setActiveProblem(problem)}
                                                                                        className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-1"
                                                                                        style={{ color: '#FF6B35' }}
                                                                                        title="Manage documents"
                                                                                    >
                                                                                        <FileText size={13} />
                                                                                    </button>
                                                                                    <button onClick={() => openEditProblem(problem)} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: '#4A4A6A' }}>
                                                                                        <Pencil size={13} />
                                                                                    </button>
                                                                                    <div className="relative">
                                                                                        <button
                                                                                            onClick={() => setConfirmDelete(confirmDelete === problem.id ? null : problem.id)}
                                                                                            className="p-1.5 rounded-lg hover:bg-red-50"
                                                                                            style={{ color: '#EF4444' }}
                                                                                        >
                                                                                            <Trash2 size={13} />
                                                                                        </button>
                                                                                        {confirmDelete === problem.id && (
                                                                                            <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-2 z-10 whitespace-nowrap" style={{ borderColor: '#E5E3DF' }}>
                                                                                                <p className="text-xs mb-1" style={{ color: '#4A4A6A' }}>Delete + all its docs?</p>
                                                                                                <button onClick={() => handleDeleteProblem(problem.id)} className="text-xs px-2 py-1 rounded bg-red-500 text-white mr-1">Yes</button>
                                                                                                <button onClick={() => setConfirmDelete(null)} className="text-xs px-2 py-1 rounded border" style={{ borderColor: '#E5E3DF' }}>No</button>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
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
                                    </>
                                )}
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
