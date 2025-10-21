import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Loading } from '@/components/common';

// ✅ Lazy loading de todas las páginas
const Home = lazy(() => import('@/pages/Home'));
const ExamMode = lazy(() => import('@/pages/ExamMode'));
const Results = lazy(() => import('@/pages/Results'));
const StudyMode = lazy(() => import('@/pages/StudyMode'));
const ReviewMode = lazy(() => import('@/pages/ReviewMode'));

// Componente de fallback mejorado
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <Loading text="Cargando..." />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exam/:subjectId" element={<ExamMode />} />
          <Route path="/results/:subjectId" element={<Results />} />
          <Route path="/review/:subjectId" element={<ReviewMode />} />
          <Route path="/study/:subjectId" element={<StudyMode />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;