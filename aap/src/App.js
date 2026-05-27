import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Settings, Users, BrainCircuit, Save, Trash2, CheckCircle2, XCircle, 
  FileText, BarChart3, ChevronRight, LogOut, Loader2, Sparkles, AlertCircle, Share2, 
  Moon, Sun, Download, LayoutDashboard, Target
} from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [assessments, setAssessments] = useState(() => JSON.parse(localStorage.getItem('gi-provas-data') || '[]'));
  const [currentView, setCurrentView] = useState('dashboard');
  
  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    localStorage.setItem('gi-provas-data', JSON.stringify(assessments));
  }, [assessments]);

  const handleCreateNew = () => {
    // Lógica para abrir editor
    alert("Função de criar avaliação aberta!");
    setCurrentView('editor');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300 min-h-screen">
        
        <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center font-bold text-gray-900">GI</div>
              <span className="font-bold tracking-tight">APP GI PROVAS</span>
            </div>
            <button onClick={toggleDark} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
              {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 lg:p-8">
          {currentView === 'dashboard' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold">Dashboard de Professor</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium">Provas Ativas</p>
                    <p className="text-4xl font-black mt-2">{assessments.length}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium">Submissões</p>
                    <p className="text-4xl font-black mt-2">0</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 dark:bg-yellow-400 text-white dark:text-gray-900 p-6 rounded-3xl flex flex-col gap-4">
                <h3 className="font-bold text-lg">Acesso Rápido</h3>
                <p className="text-gray-400 dark:text-gray-700 text-sm opacity-80">Gerencie suas avaliações com IA.</p>
                
                <div className="flex flex-col gap-2 mt-auto">
                  <button onClick={handleCreateNew} className="w-full bg-white/10 dark:bg-gray-900/10 hover:bg-white/20 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                    <Plus size={18} /> Nova Avaliação
                  </button>
                  <button onClick={handleCreateNew} className="w-full bg-yellow-400 dark:bg-gray-900 text-gray-900 dark:text-yellow-400 hover:opacity-90 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                    <Target size={18} /> Novo Simulado
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-12 bg-white dark:bg-gray-900 rounded-3xl shadow-sm">
                <h2 className="text-2xl font-bold mb-4">Editor de Avaliação</h2>
                <button onClick={() => setCurrentView('dashboard')} className="text-yellow-500 font-bold underline">Voltar ao início</button>
            </div>
          )}

          <section className="mt-12">
            <h3 className="text-xl font-bold mb-6">Suas Avaliações Recentes</h3>
            {assessments.length === 0 ? (
               <div className="text-center p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl text-gray-400">
                 <p>Nenhuma avaliação criada. Clique em "Nova Avaliação" para começar.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {assessments.map((a, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                        <h4 className="font-bold">{a.title || 'Sem título'}</h4>
                    </div>
                 ))}
               </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
