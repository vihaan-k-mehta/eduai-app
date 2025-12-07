import Link from "next/link";
import { GraduationCap, FileCheck, BookOpen, MessageSquare, BarChart3, Shield, Clock, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">EduAI</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition">Features</a>
              <a href="#benefits" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition">Benefits</a>
              <a href="#ethics" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition">AI Ethics</a>
            </div>
            <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            SJMS AI Hackathon Project
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6">
            AI-Powered Teaching
            <span className="block text-blue-600">Made Simple</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10">
            Grade assignments in seconds, generate standards-aligned lesson plans, and get instant AI feedback.
            Save up to 20 hours per week and focus on what matters most — your students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition shadow-lg shadow-blue-500/25">
              Start Teaching Smarter
            </Link>
            <a href="#features" className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-8 py-4 rounded-full font-semibold text-lg transition border border-slate-200 dark:border-slate-700">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Key Features</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Everything you need to transform your teaching workflow</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<FileCheck className="h-8 w-8" />}
              title="Automated Grading"
              description="AI grades assignments based on your rubrics. Integrates with Schoology via REST API."
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8" />}
              title="Lesson Plan Generator"
              description="Create standards-aligned lesson plans and activities based on your previous lessons."
            />
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8" />}
              title="AI Teaching Assistant"
              description="Get instant answers and support through our intelligent chatbot interface."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Data Dashboards"
              description="Visualize class trends, identify strengths and weaknesses with detailed analytics."
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Why Teachers Love EduAI</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BenefitCard icon={<Clock className="h-6 w-6" />} title="Save 20+ Hours Weekly" />
            <BenefitCard icon={<Shield className="h-6 w-6" />} title="Consistent, Unbiased Grading" />
            <BenefitCard icon={<Users className="h-6 w-6" />} title="Support for New Teachers" />
            <BenefitCard icon={<MessageSquare className="h-6 w-6" />} title="Faster Student Feedback" />
          </div>
        </div>
      </section>

      {/* AI Ethics Section */}
      <section id="ethics" className="py-20 px-4 bg-slate-100 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Committed to AI Ethics</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            <EthicsCard text="Human review required — AI never gives final grades alone" />
            <EthicsCard text="Rubric-based scoring helps reduce bias" />
            <EthicsCard text="Student data kept secure and never shared" />
            <EthicsCard text="Clear explanations for all AI decisions" />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Meet The Team</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10">Built with ❤️ by students for educators</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <TeamCard name="Varun Panchagnula" role="Research & Data Curator" />
            <TeamCard name="Vihaan Nanduri" role="Pitch & Documentation Lead" />
            <TeamCard name="Vihaan Mehta" role="AI/Engineering Lead" />
            <TeamCard name="Samar Jadhav" role="Product & UX Designer" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center bg-blue-600 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Teaching?</h2>
          <p className="text-blue-100 mb-8">Join educators saving hours every week with AI-powered assistance.</p>
          <Link href="/dashboard" className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition inline-block">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-slate-900 dark:text-white">EduAI</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 EduAI. SJMS AI Hackathon Project.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 hover:shadow-lg transition">
      <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}

function BenefitCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 flex items-center gap-4 shadow-sm">
      <div className="text-blue-600">{icon}</div>
      <span className="font-medium text-slate-900 dark:text-white">{title}</span>
    </div>
  );
}

function EthicsCard({ text }: { text: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-start gap-3">
      <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
      <span className="text-slate-700 dark:text-slate-300">{text}</span>
    </div>
  );
}

function TeamCard({ name, role }: { name: string; role: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold">
        {name.split(' ').map(n => n[0]).join('')}
      </div>
      <h4 className="font-semibold text-slate-900 dark:text-white">{name}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400">{role}</p>
    </div>
  );
}
