import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CourseAccess() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();

      if (data.valid) {
        const courseId = data.courseId || 'ai-agents';
        localStorage.setItem(`courseAccessCode_${courseId}`, code.trim());
        // Keep legacy key for backward compat with ai-agents
        if (courseId === 'ai-agents') {
          localStorage.setItem('courseAccessCode', code.trim());
        }
        navigate(`/course/${courseId}`);
      } else {
        setError('Invalid access code. Please check and try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <a href="/" className="text-xl font-light tracking-tight">
            AI Agent Expert
          </a>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-6 py-24">
        <h1 className="text-3xl font-light mb-2">Access Your Course</h1>
        <p className="text-gray-600 font-light mb-8">
          Enter the access code from your confirmation email.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter your access code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none font-mono text-sm"
            required
          />

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-black text-white font-light hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Access Course'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6">
          Don't have a code?{' '}
          <a href="/" className="text-black underline">
            Enroll here
          </a>
        </p>
      </div>
    </div>
  );
}
