import React, { useState } from 'react';
import { Check, ArrowRight, Shield, Video, BookOpen } from 'lucide-react';
import { getCourseList, getCourseById } from './courseData';

export default function AIConsultationLanding() {
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  const courses = getCourseList();
  const selectedCourse = selectedCourseId ? getCourseById(selectedCourseId) : null;

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          courseId: selectedCourseId,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Something went wrong. Please try again.');
        setLoading(false);
      }
    } catch {
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-xl font-light tracking-tight">AI Agent Expert</a>
          <div className="flex items-center gap-4">
            <a
              href="/course-access"
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              Access Course
            </a>
          </div>
        </div>
      </nav>

      {!selectedCourseId ? (
        <>
          {/* Hero Section */}
          <section className="max-w-4xl mx-auto px-6 py-24 text-center">
            <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-6 leading-tight">
              Master AI Skills.<br />Transform Your Career.
            </h1>
            <p className="text-xl text-gray-600 font-light mb-12 max-w-2xl mx-auto">
              Comprehensive courses on prompt engineering, AI behavior steering, and building production-ready AI agents.
            </p>
          </section>

          {/* Course Cards */}
          <section className="max-w-6xl mx-auto px-6 pb-20">
            <div className="grid md:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="border border-gray-200 p-8 flex flex-col"
                >
                  <h3 className="text-xl font-light mb-3">{course.title}</h3>
                  <p className="text-gray-600 font-light text-sm mb-6">
                    {course.shortDescription}
                  </p>
                  <ul className="space-y-2 mb-8 flex-1">
                    {course.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check size={16} className="shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <p className="text-2xl font-light mb-4">{course.price}</p>
                    <button
                      onClick={() => setSelectedCourseId(course.id)}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 bg-black text-white text-sm font-light hover:bg-gray-800 transition-colors"
                    >
                      Enroll Now
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* About */}
          <section className="max-w-4xl mx-auto px-6 py-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-light mb-6">From Journalist to AI Builder</h2>
                <p className="text-gray-600 font-light mb-4">
                  I've successfully transitioned from broadcast journalism to building AI-powered applications, creating tools that help professionals leverage AI in their work.
                </p>
                <p className="text-gray-600 font-light mb-4">
                  With hands-on experience building production AI systems, I understand both the technical skills you need and the practical challenges you'll face.
                </p>
                <p className="text-gray-600 font-light">
                  Let me help you navigate your own AI transformation.
                </p>
              </div>
              <div className="bg-gray-100 aspect-square flex items-center justify-center text-gray-400">
                [Your Photo]
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="bg-gray-50 py-20">
            <div className="max-w-5xl mx-auto px-6">
              <h2 className="text-3xl font-light text-center mb-16">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: BookOpen, title: '1. Enroll', desc: 'Choose a course, sign up, and complete payment to get your access code' },
                  { icon: Shield, title: '2. Get Access', desc: 'Receive your unique access code via email after payment' },
                  { icon: Video, title: '3. Start Learning', desc: 'Enter your code and get immediate access to all course materials' }
                ].map((step, i) => (
                  <div key={i} className="text-center">
                    <step.icon className="mx-auto mb-4" size={32} strokeWidth={1} />
                    <h3 className="text-lg font-light mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm font-light">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Enrollment Flow */
        <section className="max-w-2xl mx-auto px-6 py-16">
          <button
            onClick={() => setSelectedCourseId(null)}
            className="text-sm text-gray-600 mb-8 hover:text-black"
          >
            &larr; Back to courses
          </button>

          <h2 className="text-3xl font-light mb-8">Enroll in {selectedCourse.title}</h2>

          <form onSubmit={handleBooking} className="space-y-8">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-light mb-4">Your Information</h3>
              <input
                type="text"
                placeholder="Full Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none"
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-6 space-y-3">
              <h3 className="text-lg font-light mb-4">Enrollment Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Course</span>
                <span>{selectedCourse.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Access</span>
                <span>Lifetime</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between font-light">
                  <span>Total</span>
                  <span className="text-xl">{selectedCourse.price}</span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.email}
              className="w-full py-4 bg-black text-white font-light hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Redirecting to payment...' : `Pay ${selectedCourse.price}`}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
