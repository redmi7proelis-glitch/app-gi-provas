import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Settings, Users, BrainCircuit, 
  Save, Trash2, CheckCircle2, XCircle, FileText, 
  BarChart3, ChevronRight, LogOut, Loader2, Sparkles, AlertCircle
} from 'lucide-react';

const INITIAL_DATA = [
  {
    id: '1',
    title: 'Avaliação de História - 1º Bimestre',
    className: 'Turma 101',
    questions: [
      {
        id: 'q1',
        text: 'Qual foi o principal motivo para a Revolução Francesa?',
        options: ['Descoberta da América', 'Crise econômica e insatisfação com a monarquia', 'Invenção do vapor', 'Fim do Império Romano'],
        correctOptionIndex: 1,
        feedback: 'A Revolução Francesa foi impulsionada pela desigualdade social e crise econômica.'
      }
    ]
  }
];

export default function App() {
  const [role, setRole] = useState('teacher');
  const [assessments, setAssessments] = useState(() => JSON.parse(localStorage.getItem('gi-provas-data') || JSON.stringify(INITIAL_DATA)));
  const [submissions, setSubmissions] = useState(() => JSON.parse(localStorage.getItem('gi-provas-subs') || '[]'));
  const [view, setView] = useState('dashboard');
  const [activeAssessment, setActiveAssessment] = useState(null);

  useEffect(() => {
    localStorage.setItem('gi-provas-data', JSON.stringify(assessments));
    localStorage.setItem('gi-provas-subs', JSON.stringify(submissions));
  }, [assessments, submissions]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-gray-900 text-white p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-400 text-gray-900 font-black flex items-center justify-center rounded">GI</div>
          <h1 className="font-bold text-lg">APP GI PROVAS</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setRole('teacher')} className={`px-3 py-1 text-sm rounded ${role === 'teacher' ? 'bg-yellow-400 text-gray-900' : 'text-gray-400'}`}>Professor</button>
          <button onClick={() => setRole('student')} className={`px-3 py-1 text-sm rounded ${role === 'student' ? 'bg-yellow-400 text-gray-900' : 'text-gray-400'}`}>Aluno</button>
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
  if (view === 'dashboard') return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Painel do Professor</h2>
        <button onClick={() => { setActiveAssessment(null); setView('editor'); }} className="bg-yellow-400 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Plus size={18} /> Nova Prova
        </button>
      </div>
      <div className="grid gap-3">
        {assessments.map(a => (
          <div key={a.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
            <div>
              <h3 className="font-bold">{a.title}</h3>
              <p className="text-sm text-gray-500">{a.className}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setActiveAssessment(a); setView('report'); }} className="bg-gray-900 text-white px-3 py-1 rounded text-sm">Notas</button>
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
  const [loading, setLoading] = useState(false);

  const handleAi = () => {
    setLoading(true);
    setTimeout(() => {
      onSave({ id: Date.now(), title: "Prova de " + title, className: "Turma X", questions: [{ text: "Questão gerada por IA", options: ['A','B','C','D'], correctOptionIndex: 0 }] });
    }, 1500);
  };

  return (
    <div className="bg-white p-6 rounded-xl border">
      <input className="w-full border p-2 mb-4 rounded" placeholder="Título da Avaliação" value={title} onChange={e => setTitle(e.target.value)} />
      <button onClick={handleAi} className="bg-gray-900 text-white w-full py-3 rounded-lg flex items-center justify-center gap-2">
        {loading ? <Loader2 className="animate-spin" /> : <BrainCircuit />} Gerar com IA
      </button>
      <button onClick={onCancel} className="mt-4 text-gray-500 w-full underline">Cancelar</button>
    </div>
  );
}

function StudentView({ assessments, view, setView, activeAssessment, setActiveAssessment, setSubmissions }) {
  if (view === 'dashboard') return (
    <div>
      <h2 className="text-xl font-bold mb-4">Provas Disponíveis</h2>
      {assessments.map(a => (
        <div key={a.id} className="bg-white p-4 rounded-xl border mb-3 flex justify-between items-center">
          <h3 className="font-bold">{a.title}</h3>
          <button onClick={() => { setActiveAssessment(a); setView('taker'); }} className="bg-yellow-400 px-4 py-1 rounded font-bold">Iniciar</button>
        </div>
      ))}
    </div>
  );
  if (view === 'taker') return <AssessmentTaker assessment={activeAssessment} onSubmit={(r) => { setSubmissions(prev => [...prev, r]); setView('dashboard'); }} />;
  return null;
}

function AssessmentTaker({ assessment, onSubmit }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">{assessment.title}</h2>
      <p>Questão: {assessment.questions[0].text}</p>
      <button onClick={() => onSubmit({ score: 1, studentName: 'Aluno Teste' })} className="mt-4 bg-green-500 text-white px-6 py-2 rounded">Enviar Prova</button>
    </div>
  );
}

function TeacherReport({ assessment, submissions, onBack }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Relatório: {assessment.title}</h2>
      {submissions.length === 0 ? <p>Nenhuma entrega.</p> : submissions.map((s,i) => <div key={i}>Nota: {s.score} - Aluno: {s.studentName}</div>)}
      <button onClick={onBack} className="mt-4 underline">Voltar</button>
    </div>
  );
}
