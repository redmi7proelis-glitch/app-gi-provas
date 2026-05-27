import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Settings, Users, BrainCircuit, Save, Trash2, CheckCircle2, XCircle, 
  FileText, BarChart3, ChevronRight, LogOut, Loader2, Sparkles, AlertCircle, Share2, 
  Moon, Sun, Download, Target, Check
} from 'lucide-react';

export default function App() {
  const [role, setRole] = useState(window.location.hash.includes('student') ? 'student' : 'teacher');
  const [assessments, setAssessments] = useState(() => JSON.parse(localStorage.getItem('gi-provas-data') || '[]'));
  const [submissions, setSubmissions] = useState(() => JSON.parse(localStorage.getItem('gi-provas-subs') || '[]'));
  const [view, setView] = useState('dashboard');
  const [activeAssessment, setActiveAssessment] = useState(null);

  useEffect(() => {
    localStorage.setItem('gi-provas-data', JSON.stringify(assessments));
    localStorage.setItem('gi-provas-subs', JSON.stringify(submissions));
  }, [assessments, submissions]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-gray-900 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-400 text-gray-900 font-black flex items-center justify-center rounded">GI</div>
            <h1 className="font-bold text-lg">APP GI PROVAS</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase bg-gray-800 px-2 py-1 rounded">{role === 'teacher' ? 'Prof' : 'Aluno'}</span>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        {role === 'teacher' ? (
          <TeacherView 
            assessments={assessments} 
            submissions={submissions}
            view={view} 
            setView={setView}
            activeAssessment={activeAssessment}
            setActiveAssessment={setActiveAssessment}
            setAssessments={setAssessments}
          />
        ) : (
          <StudentView 
            assessments={assessments} 
            view={view}
            setView={setView}
            activeAssessment={activeAssessment}
            setActiveAssessment={setActiveAssessment}
            setSubmissions={setSubmissions}
          />
        )}
      </main>
    </div>
  );
}

function TeacherView({ assessments, submissions, view, setView, activeAssessment, setActiveAssessment, setAssessments }) {
  const handleCopyLink = () => {
    const url = window.location.origin + window.location.pathname + '#student';
    navigator.clipboard.writeText(url);
    alert('Link do aluno copiado!');
  };

  if (view === 'dashboard') return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Painel do Professor</h2>
        <div className="flex gap-2">
            <button onClick={handleCopyLink} className="bg-white border border-gray-300 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                <Share2 size={18} /> Link Aluno
            </button>
            <button onClick={() => { setActiveAssessment(null); setView('editor'); }} className="bg-yellow-400 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
              <Plus size={18} /> Nova Prova
            </button>
        </div>
      </div>
      <div className="grid gap-3">
        {assessments.map(a => (
          <div key={a.id} className="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm">
            <div>
              <h3 className="font-bold">{a.title}</h3>
              <p className="text-sm text-gray-500">{a.className} • {a.questions.length} questões</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setActiveAssessment(a); setView('report'); }} className="bg-gray-900 text-white px-3 py-1 rounded text-sm">Ver Notas</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  if (view === 'editor') return <AssessmentEditor onSave={(a) => { setAssessments([...assessments, a]); setView('dashboard'); }} onCancel={() => setView('dashboard')} />;
  if (view === 'report') return <TeacherReport assessment={activeAssessment} submissions={submissions} onBack={() => setView('dashboard')} />;
  return null;
}

function AssessmentEditor({ onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);

  const handleAi = () => {
    setLoading(true);
    // Simulação de geração de questões
    setTimeout(() => {
        const newQuestions = Array(Number(count)).fill(0).map((_, i) => ({
            text: `Questão ${topic} - ${i+1}`,
            options: ['A', 'B', 'C', 'D'],
            correctOptionIndex: 0
        }));
        onSave({ id: Date.now(), title: title || "Prova de " + topic, className: "Turma X", questions: newQuestions });
    }, 1500);
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h2 className="text-xl font-bold mb-4">Criar Avaliação</h2>
      <input className="w-full border p-2 mb-4 rounded" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <input className="w-full border p-2 mb-2 rounded" placeholder="Assunto (ex: História)" value={topic} onChange={e => setTopic(e.target.value)} />
        <input type="number" className="w-full border p-2 mb-2 rounded" placeholder="Número de questões" value={count} onChange={e => setCount(e.target.value)} />
        <button onClick={handleAi} className="bg-gray-900 text-white w-full py-3 rounded-lg flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <BrainCircuit />} Gerar com IA
        </button>
      </div>
      <button onClick={onCancel} className="mt-4 text-gray-500 w-full underline">Cancelar</button>
    </div>
  );
}

function StudentView({ assessments, view, setView, activeAssessment, setActiveAssessment, setSubmissions }) {
  if (view === 'dashboard') return (
    <div>
      <h2 className="text-xl font-bold mb-4">Provas Disponíveis</h2>
      {assessments.map(a => (
        <div key={a.id} className="bg-white p-4 rounded-xl border mb-3 flex justify-between items-center shadow-sm">
          <div>
            <h3 className="font-bold">{a.title}</h3>
            <p className="text-sm">{a.questions.length} questões</p>
          </div>
          <button onClick={() => { setActiveAssessment(a); setView('taker'); }} className="bg-yellow-400 px-4 py-2 rounded font-bold">Iniciar</button>
        </div>
      ))}
    </div>
  );
  if (view === 'taker') return <AssessmentTaker assessment={activeAssessment} onSubmit={(r) => { setSubmissions(prev => [...prev, r]); setView('dashboard'); }} />;
  return null;
}

function AssessmentTaker({ assessment, onSubmit }) {
  const [name, setName] = useState('');
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border">
      <h2 className="text-xl font-bold mb-4">{assessment.title}</h2>
      <input className="w-full border p-2 mb-4 rounded" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} />
      <p className="mb-4">Questões: {assessment.questions.length}</p>
      <button onClick={() => onSubmit({ score: Math.floor(Math.random()*10), studentName: name || 'Aluno' })} className="bg-green-500 text-white px-6 py-2 rounded font-bold w-full">Enviar</button>
    </div>
  );
}

function TeacherReport({ assessment, submissions, onBack }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h2 className="text-xl font-bold mb-4">Notas: {assessment.title}</h2>
      {submissions.length === 0 ? <p>Nenhuma entrega.</p> : submissions.map((s,i) => <div key={i} className="border-b p-2">Aluno: {s.studentName} | Nota: {s.score}</div>)}
      <button onClick={onBack} className="mt-4 bg-gray-200 px-4 py-2 rounded">Voltar</button>
    </div>
  );
}
```
