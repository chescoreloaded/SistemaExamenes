import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './components/common/PageTransition';
import { SoundProvider } from './context/SoundContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { useEffect } from 'react';
import { Howler } from 'howler'; // ✅ Importamos Howler

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Home from './pages/Home';
import ExamMode from './pages/ExamMode';
import StudyMode from './pages/StudyMode';
import Results from './pages/Results';
import ReviewMode from './pages/ReviewMode';
import Analytics from './pages/Analytics';
import CourseExplorer from './pages/CourseExplorer';
import CourseDetails from './pages/CourseDetails';

// Componente de Scroll
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Wrapper interno para rutas con animaciones específicas
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* RUTAS PRINCIPALES */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/explorer" element={<CourseExplorer />} />
          <Route path="/course/:subjectId" element={<CourseDetails />} />
        </Route>
        
        {/* RUTAS INMERSIVAS */}
        <Route path="/exam/:subjectId" element={
          <PageTransition type="slideLeft">
            <ExamMode />
          </PageTransition>
        } />
        
        <Route path="/study/:subjectId" element={
          <PageTransition type="slideLeft">
            <StudyMode />
          </PageTransition>
        } />
        
        <Route path="/results/:subjectId" element={
          <PageTransition type="scale">
            <Results />
          </PageTransition>
        } />

        <Route path="/review/:subjectId" element={
          <PageTransition type="slideUp">
            <ReviewMode />
          </PageTransition>
        } />

      </Routes>
    </AnimatePresence>
  );
}

function App() {
  
  // ✅ EFECTO GLOBAL: Desbloquear AudioContext al primer clic
  useEffect(() => {
    const unlockAudio = () => {
      // Verificamos si existe ctx antes de acceder
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }
    };

    // Escuchamos una sola vez en varios eventos para asegurar compatibilidad móvil
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  return (
    <LanguageProvider>
      <SoundProvider>
        <ThemeProvider>
          <Router>
            <ScrollToTop />
            <AnimatedRoutes />
          </Router>
        </ThemeProvider>
      </SoundProvider>
    </LanguageProvider>
  );
}

export default App;