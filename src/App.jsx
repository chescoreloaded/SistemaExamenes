import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import ExamMode from '@/pages/ExamMode';
import Results from '@/pages/Results';
import StudyMode from '@/pages/StudyMode';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exam/:subjectId" element={<ExamMode />} />
        <Route path="/results/:subjectId" element={<Results />} />
        <Route path="/study/:subjectId" element={<StudyMode />} />
      </Routes>
    </Router>
  );
}

export default App;