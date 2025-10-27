import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './components/common/PageTransition';

// ✅ PASO 1: Importar el Proveedor de Sonido
import { SoundProvider } from './context/SoundContext';

// Pages
import Home from './pages/Home';
import ExamMode from './pages/ExamMode';
import StudyMode from './pages/StudyMode';
import Results from './pages/Results';
import ReviewMode from './pages/ReviewMode';

// Wrapper interno para usar useLocation
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition type="fade">
            <Home />
          </PageTransition>
        } />
        
        <Route path="/exam/:subjectId" element={
          <PageTransition type="slideLeft">
            <ExamMode />
          </PageTransition>
        } />
        
        {/* ✅ NUEVA RUTA: Modo Estudio */}
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
    // ✅ PASO 2: Envolver la aplicación con el Proveedor
    <SoundProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </SoundProvider>
  );
}

export default App;