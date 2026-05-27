import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Settings, Users, BrainCircuit, Save, Trash2, 
  CheckCircle2, XCircle, FileText, BarChart3, ChevronRight, 
  LogOut, Sparkles, Moon, Sun, LayoutDashboard
} from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('gi-theme') === 'dark');
  const [assessments, setAssessments] = useState(() => JSON.parse(localStorage.getItem('gi-provas') || '[]'));
  const [submissions, setSubmissions] = useState(() => JSON.parse(localStorage.getItem('gi-submissions') || '[]'));
  
  useEffect(() => {
    localStorage.setItem('gi-provas', JSON.stringify(assessments));
    localStorage.setItem('gi-submissions', JSON.stringify(submissions));
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [assessments, submissions, darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <header className="p-6 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center font-black text-gray-900">GI</div>
            <h1 className="font-bold text-xl tracking-tight">APP GI PROVAS</h1>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800">
            {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
          </button>
        </header>

        <main className="p-6 max-w-7xl mx-auto">
           {/* Bento Grid layout simples */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-bold mb-6">Dashboard de Professor</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-yellow-400/10 p-6 rounded-2xl border border-yellow-400/20">
                    <p className="text-yellow-600 dark:text-yellow-400 font-bold">Provas Ativas</p>
                    <p className="text-4xl font-black">{assessments.length}</p>
                  </div>
                  <div className="bg-blue-400/10 p-6 rounded-2xl border border-blue-400/20">
                    <p className="text-blue-600 dark:text-blue-400 font-bold">Submissões</p>
                    <p className="text-4xl font-black">{submissions.length}</p>
                  </div>
                </div>
             </div>
             
             <div className="bg-gray-900 dark:bg-yellow-400 text-white dark:text-gray-900 p-8 rounded-3xl flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-2">Acesso Rápido</h3>
                  <p className="text-gray-400 dark:text-gray-700 text-sm">Gerencie suas avaliações com IA.</p>
                </div>
                <button className="mt-6 w-full py-4 bg-white/10 dark:bg-gray-900/10 rounded-xl font-bold hover:scale-[1.02] transition-transform">
                  Nova Avaliação
                </button>
             </div>
           </div>
        </main>
      </div>
    </div>
  );
}
