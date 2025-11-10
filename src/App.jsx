import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './components/common/PageTransition';
import { SoundProvider } from './context/SoundContext';
import { LanguageProvider } from './context/LanguageContext';

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

// Wrapper interno para rutas con animaciones específicas
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* ✅ RUTAS PRINCIPALES (Usan MainLayout) */}
        {/* El layout ya maneja la transición base "fade" para sus hijos */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/explorer" element={<CourseExplorer />} />
        </Route>
        
        {/* 🚀 RUTAS INMERSIVAS (Headers personalizados, transiciones específicas) */}
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
  return (
    <LanguageProvider>
      <SoundProvider>
        <Router>
          <AnimatedRoutes />
        </Router>
      </SoundProvider>
    </LanguageProvider>
  );
}

export default App;