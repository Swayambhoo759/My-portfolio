import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import LoadingScreen from './components/LoadingScreen'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/Contact'
import AdminPanel from './components/AdminPanel'
import ScrollToTop from './components/ScrollToTop'

function App() {
  const [loading, setLoading] = useState(true)
  const [adminOpen, setAdminOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <>
          <Navbar onAdminClick={() => setAdminOpen(true)} />

          <main className="md:ml-[220px] pt-16 md:pt-0">
            <Hero />
            <About />
            <Projects />
            <Skills />
            <Contact />
          </main>

          <ScrollToTop />

          <AdminPanel
            isOpen={adminOpen}
            onClose={() => setAdminOpen(false)}
          />
        </>
      )}
    </>
  )
}

export default App
