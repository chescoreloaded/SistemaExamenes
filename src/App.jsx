import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './components/common/PageTransition';
import { SoundProvider } from './context/SoundContext';
import { LanguageProvider } from './context/LanguageContext';
import { useEffect } from 'react'; // ✅ 1. Importar useEffect

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

// ✅ 2. Componente de Scroll
// Este componente arreglará el Problema 2 (scroll descentrado)
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]); // Se ejecuta CADA VEZ que la ruta cambia

  return null;
}


// Wrapper interno para rutas con animaciones específicas
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* ✅ RUTAS PRINCIPALES (Usan MainLayout - Zonas Seguras) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/explorer" element={<CourseExplorer />} />
          <Route path="/course/:subjectId" element={<CourseDetails />} />
        </Route>
        
        {/* 🚀 RUTAS INMERSIVAS (Headers personalizados, sin distracción) */}
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
          <ScrollToTop /> {/* ✅ 3. Añadir el componente aquí */}
          <AnimatedRoutes />
        </Router>
      </SoundProvider>
    </LanguageProvider>
  );
}

export default App;