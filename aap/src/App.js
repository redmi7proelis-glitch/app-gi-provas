import React, { useState, useEffect } from 'react';
import { Plus, Target, BookOpen, Sun, Moon, Trash2 } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [assessments, setAssessments] = useState(() => JSON.parse(localStorage.getItem('gi-provas-data') || '[]'));

  useEffect(() => {
    localStorage.setItem('gi-provas-data', JSON.stringify(assessments));
  }, [assessments]);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors min-h-screen">
        <header className="border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="font-bold text-xl">APP GI PROVAS</h1>
            <button onClick={toggleDark} className="p-2 rounded-full bg-gray-200 dark:bg-gray-800">
              {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800">
                <p className="text-gray-500">Provas Ativas</p>
                <p className="text-4xl font-black">{assessments.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800">
                <p className="text-gray-500">Submissões</p>
                <p className="text-4xl font-black">0</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 dark:bg-yellow-400 text-white dark:text-gray-900 p-6 rounded-3xl flex flex-col gap-4">
            <h3 className="font-bold text-lg">Acesso Rápido</h3>
            <button onClick={() => setAssessments([...assessments, {title: 'Nova Prova'}])} className="w-full bg-white/10 py-3 rounded-xl font-bold hover:bg-white/20 flex items-center justify-center gap-2">
              <Plus size={18} /> Nova Avaliação
            </button>
            <button className="w-full bg-yellow-400 dark:bg-gray-900 text-gray-900 dark:text-yellow-400 py-3 rounded-xl font-bold hover:opacity-90 flex items-center justify-center gap-2">
              <Target size={18} /> Novo Simulado
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
```
