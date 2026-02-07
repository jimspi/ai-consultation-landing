import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, Play, FileText, LogOut } from 'lucide-react';
import { getCourseById } from './courseData';

export default function CourseDashboard() {
  const { courseId } = useParams();
  const course = getCourseById(courseId);
  const navigate = useNavigate();

  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!course) {
      navigate('/course-access');
      return;
    }

    // Try per-course key first, fall back to legacy key for ai-agents
    let code = localStorage.getItem(`courseAccessCode_${courseId}`);
    if (!code && courseId === 'ai-agents') {
      code = localStorage.getItem('courseAccessCode');
    }

    if (!code) {
      navigate('/course-access');
      return;
    }

    fetch('/api/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        const returnedCourseId = data.courseId || 'ai-agents';
        if (!data.valid || returnedCourseId !== courseId) {
          localStorage.removeItem(`courseAccessCode_${courseId}`);
          if (courseId === 'ai-agents') {
            localStorage.removeItem('courseAccessCode');
          }
          navigate('/course-access');
        } else {
          setVerified(true);
          setCurrentLessonId(course.modules[0].lessons[0].id);
          setExpandedModules({ [course.modules[0].id]: true });
        }
      })
      .catch(() => {
        navigate('/course-access');
      })
      .finally(() => setChecking(false));
  }, [navigate, courseId, course]);

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const allLessons = course ? course.modules.flatMap((m) => m.lessons) : [];
  const currentLesson = allLessons.find((l) => l.id === currentLessonId);

  const handleLogout = () => {
    localStorage.removeItem(`courseAccessCode_${courseId}`);
    if (courseId === 'ai-agents') {
      localStorage.removeItem('courseAccessCode');
    }
    navigate('/');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 font-light">Verifying access...</p>
      </div>
    );
  }

  if (!verified || !course) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <nav className="border-b border-gray-100 shrink-0">
        <div className="max-w-full mx-auto px-6 py-3 flex justify-between items-center">
          <a href="/" className="text-lg font-light tracking-tight">
            AI Agent Expert
          </a>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-black"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 border-r border-gray-100 overflow-y-auto shrink-0 bg-gray-50">
          <div className="p-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              {course.title}
            </h2>
            {course.modules.map((module) => (
              <div key={module.id} className="mb-2">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium hover:bg-gray-100 rounded transition-colors"
                >
                  {expandedModules[module.id] ? (
                    <ChevronDown size={16} className="shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="shrink-0" />
                  )}
                  {module.title}
                </button>
                {expandedModules[module.id] && (
                  <div className="ml-4 mt-1 space-y-1">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLessonId(lesson.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded transition-colors ${
                          currentLessonId === lesson.id
                            ? 'bg-black text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {lesson.type === 'video' ? (
                          <Play size={14} className="shrink-0" />
                        ) : lesson.type === 'mixed' ? (
                          <Play size={14} className="shrink-0" />
                        ) : (
                          <FileText size={14} className="shrink-0" />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {currentLesson && (
            <div className="max-w-3xl mx-auto px-8 py-8">
              <h1 className="text-3xl font-light mb-6">{currentLesson.title}</h1>

              {/* Video placeholder for video/mixed lessons */}
              {(currentLesson.type === 'video' || currentLesson.type === 'mixed') && (
                <div className="mb-8">
                  {currentLesson.videoUrl ? (
                    <div className="aspect-video bg-black rounded">
                      <video
                        key={currentLesson.videoUrl}
                        controls
                        preload="metadata"
                        className="w-full h-full rounded"
                      >
                        <source src={currentLesson.videoUrl} type="video/mp4" />
                        Your browser does not support the video element.
                      </video>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-900 rounded flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Play size={48} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Video coming soon</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lesson content */}
              <div
                className="prose prose-gray max-w-none
                  [&_h2]:text-2xl [&_h2]:font-light [&_h2]:mt-8 [&_h2]:mb-4
                  [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mt-6 [&_h3]:mb-3
                  [&_p]:text-gray-700 [&_p]:font-light [&_p]:leading-relaxed [&_p]:mb-4
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1
                  [&_li]:text-gray-700 [&_li]:font-light
                  [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:mb-4 [&_pre]:text-sm
                  [&_code]:font-mono [&_code]:text-sm
                  [&_p>code]:bg-gray-100 [&_p>code]:px-1.5 [&_p>code]:py-0.5 [&_p>code]:rounded [&_p>code]:text-gray-800
                  [&_li>code]:bg-gray-100 [&_li>code]:px-1.5 [&_li>code]:py-0.5 [&_li>code]:rounded [&_li>code]:text-gray-800
                  [&_strong]:font-medium"
                dangerouslySetInnerHTML={{ __html: currentLesson.content }}
              />

              {/* Next lesson navigation */}
              <div className="mt-12 pt-6 border-t border-gray-100">
                {(() => {
                  const currentIndex = allLessons.findIndex(
                    (l) => l.id === currentLessonId
                  );
                  const nextLesson = allLessons[currentIndex + 1];
                  const prevLesson = allLessons[currentIndex - 1];

                  return (
                    <div className="flex justify-between">
                      {prevLesson ? (
                        <button
                          onClick={() => setCurrentLessonId(prevLesson.id)}
                          className="text-sm text-gray-600 hover:text-black transition-colors"
                        >
                          &larr; {prevLesson.title}
                        </button>
                      ) : (
                        <div />
                      )}
                      {nextLesson ? (
                        <button
                          onClick={() => setCurrentLessonId(nextLesson.id)}
                          className="text-sm text-black font-medium hover:underline transition-colors"
                        >
                          {nextLesson.title} &rarr;
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">
                          You've reached the end!
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
