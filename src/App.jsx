import { BrowserRouter, Routes, Route, useSearchParams, Navigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AIConsultationLanding from './AIConsultationLanding';
import CourseAccess from './CourseAccess';
import CourseDashboard from './CourseDashboard';
import { getCourseById } from './courseData';

function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const courseId = searchParams.get('course');
  const course = courseId ? getCourseById(courseId) : null;

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <a href="/" className="text-xl font-light tracking-tight">
            AI Agent Expert
          </a>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-light mb-4">Payment Successful!</h1>
        <p className="text-gray-600 font-light mb-8">
          Thank you for enrolling in {course ? course.title : 'the course'}. Check your email for your unique access code to start the course.
        </p>

        <a
          href="/course-access"
          className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white font-light hover:bg-gray-800 transition-colors"
        >
          Enter Access Code
          <ArrowRight size={18} />
        </a>

        {sessionId && (
          <p className="text-xs text-gray-400 mt-6">
            Session: {sessionId}
          </p>
        )}
      </div>
    </div>
  );
}

function LegacyCourseRedirect() {
  const savedCode = localStorage.getItem('courseAccessCode');
  if (savedCode) {
    return <Navigate to="/course/ai-agents" replace />;
  }
  return <Navigate to="/course-access" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AIConsultationLanding />} />
        <Route path="/success" element={<Success />} />
        <Route path="/course-access" element={<CourseAccess />} />
        <Route path="/course/:courseId" element={<CourseDashboard />} />
        <Route path="/course" element={<LegacyCourseRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
