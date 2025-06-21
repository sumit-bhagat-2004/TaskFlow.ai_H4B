import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Users, Brain, RefreshCw, Calendar, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Background Animations */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 opacity-20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl animate-pulse delay-200" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-pink-500 opacity-20 rounded-full blur-3xl animate-pulse delay-500" />

      {/* Hero Content */}
      <main className="z-10 flex-grow flex items-center justify-center text-center px-4">
        <div className="max-w-4xl">
          <h2 className="text-5xl font-extrabold leading-tight mb-6">
            Supercharge Your Workflow with{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              TaskFlow.ai
            </span>
          </h2>
          <p className="text-gray-300 text-lg mb-10">
            AI-powered project management for next-gen teams. Automate tasks,
            collaborate effortlessly, and get real-time productivity insights.
          </p>
          <Link href="/features">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-md hover:shadow-xl transition-all">
              Let's Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </main>

      {/* Why Use Section */}
      <section className="z-10 py-20 px-4 bg-black/20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-4">Why Should You Use TaskFlow.ai?</h3>
          <p className="text-gray-300 text-lg mb-12 max-w-3xl mx-auto">
            In today's fast-paced environment, teams need more than just a to-do list. TaskFlow.ai brings intelligence to your project management, automating the mundane, predicting roadblocks, and empowering your team to focus on what they do best: innovate.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-5 border border-white/20 rounded-lg shadow-md transition-all flex items-center gap-2">
              <Zap size={18} /> AI Task Automation
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-5 border border-white/20 rounded-lg shadow-md transition-all flex items-center gap-2">
              <Users size={18} /> Seamless Collaboration
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-5 border border-white/20 rounded-lg shadow-md transition-all flex items-center gap-2">
              <Brain size={18} /> Productivity Insights
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-5 border border-white/20 rounded-lg shadow-md transition-all flex items-center gap-2">
              <RefreshCw size={18} /> Dynamic Load Balancing
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-5 border border-white/20 rounded-lg shadow-md transition-all flex items-center gap-2">
              <Calendar size={18} /> Smart Scheduling
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-5 border border-white/20 rounded-lg shadow-md transition-all flex items-center gap-2">
              <ChevronRight size={18} /> Customizable Workflows
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="z-10 border-t border-white/10 py-6 px-6 bg-white/5 backdrop-blur">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2024 TaskFlow.ai. All rights reserved.</p>
          <div className="flex gap-4 mt-3 md:mt-0">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/cookies" className="hover:text-white">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 