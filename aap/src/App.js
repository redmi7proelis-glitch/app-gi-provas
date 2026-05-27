import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { 
  BookOpen, Plus, Settings, Users, BrainCircuit, 
  Save, Trash2, CheckCircle2, XCircle, FileText, 
  BarChart3, ChevronRight, LogOut, Loader2, Sparkles, AlertCircle, Share2, Check, Info, Wifi, WifiOff
} from 'lucide-react';

const INITIAL_ASSESSMENTS = [
  {
    id: '1',
    title: 'Avaliação de História - 1º Bimestre',
    date: '2026-06-10',
    className: 'Turma 101 - Manhã',
    type: 'prova',
    published: true,
    questions: [
      {
        id: 'q1',
        text: 'Qual foi o principal motivo para a Revolução Francesa?',
        options: [
          'A descoberta de novas terras na América.',
          'A insatisfação popular com a monarquia absolutista e a crise económica.',
          'A invenção da máquina a vapor.',
          'O fim do Império Romano.'
        ],
        correctOptionIndex: 1,
        feedback: 'A Revolução Francesa foi impulsionada pela desigualdade social e crise económica sob o regime de Luís XVI.'
      }
    ]
  }
];

const generateQuestionsWithAI = async (topic, count = 1) => {
  const apiKey = ""; // A chave é injetada pelo ambiente
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const prompt = `Atue como um professor especialista criando uma avaliação.
Crie ${count} questão(ões) de múltipla escolha sobre o tema: "${topic}".
As questões devem ter nível adequado para ensino médio/fundamental.
Retorne a resposta EXCLUSIVAMENTE como um ARRAY JSON válido, seguindo ESTRITAMENTE esta estrutura, sem nenhum texto adicional, blocos de markdown (\`\`\`json) ou comentários:
[
  {
    "text": "Texto detalhado da pergunta",
    "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
    "correctOptionIndex": 0,
    "feedback": "Explicação didática do porquê a resposta correta está certa e as outras erradas."
  }
]`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
        }
      })
    });

    if (!response.ok) throw new Error('Falha na API da IA');
    
    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) throw new Error('Resposta vazia da IA');
    
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Erro ao gerar questão:", error);
    throw error;
  }
};

// Configuração do Firebase Storage
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

export default function App() {
  const [role, setRole] = useState(() => {
    return window.location.hash.includes('student') ? 'student' : 'teacher';
  });
  const [isStudentLink, setIsStudentLink] = useState(() => {
    return window.location.hash.includes('student');
  });

  const [assessments, setAssessments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [user, setUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'connected', 'error'

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Erro na autenticação:", error);
        setConnectionStatus('error');
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const assessmentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'assessments');
    const unsubAssessments = onSnapshot(assessmentsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConnectionStatus('connected');
      
      if (data.length === 0 && snapshot.metadata.fromCache === false) {
         INITIAL_ASSESSMENTS.forEach(async (assessment) => {
           await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assessments', assessment.id), assessment);
         });
      } else {
        setAssessments(data);
      }
    }, (error) => {
      console.error("Erro ao escutar avaliações:", error);
      setConnectionStatus('error');
    });

    const submissionsRef = collection(db, 'artifacts', appId, 'public', 'data', 'submissions');
    const unsubSubmissions = onSnapshot(submissionsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(data);
    }, (error) => {
      console.error("Erro ao escutar entregas:", error);
    });

    return () => {
      unsubAssessments();
      unsubSubmissions();
    };
  }, [user]);

  const renderHeader = () => (
    <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
          <div className="w-10 h-10 bg-yellow-400 text-gray-900 font-black flex items-center justify-center rounded-lg text-xl tracking-tighter">
            GI
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-base sm:text-xl tracking-wide">
              APP <span className="text-yellow-400">GI PROVAS</span>
            </h1>
            {/* Status da Conexão em Tempo Real */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {connectionStatus === 'connecting' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                  <span className="text-[10px] text-gray-400 font-medium">Sincronizando...</span>
                </>
              )}
              {connectionStatus === 'connected' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Nuvem Ativa</span>
                </>
              )}
              {connectionStatus === 'error' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="text-[10px] text-red-400 font-bold">Erro de Rede</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {!isStudentLink && (
          <div className="flex items-center gap-4">
            <div className="bg-gray-800 p-1 rounded-lg flex text-sm font-medium">
              <button 
                onClick={() => { setRole('teacher'); setCurrentView('dashboard'); }}
                className={`px-3 sm:px-4 py-1.5 rounded-md transition-colors ${role === 'teacher' ? 'bg-yellow-400 text-gray-900' : 'text-gray-400 hover:text-white'}`}
              >
                Professor
              </button>
              <button 
                onClick={() => { setRole('student'); setCurrentView('dashboard'); }}
                className={`px-3 sm:px-4 py-1.5 rounded-md transition-colors ${role === 'student' ? 'bg-yellow-400 text-gray-900' : 'text-gray-400 hover:text-white'}`}
              >
                Aluno
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {renderHeader()}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {role === 'teacher' ? (
          <>
            {currentView === 'dashboard' && (
              <TeacherDashboard 
                assessments={assessments} 
                onEdit={(a) => { setActiveAssessment(a); setCurrentView('editor'); }}
                onCreate={() => { setActiveAssessment(null); setCurrentView('editor'); }}
                onViewReports={(a) => { setActiveAssessment(a); setCurrentView('report'); }}
                onDelete={async (id) => {
                  if (!user) return;
                  try {
                    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assessments', id));
                  } catch (error) {
                    console.error("Erro ao excluir:", error);
                  }
                }}
                onSimulateStudent={() => {
                  window.location.hash = 'student';
                  setIsStudentLink(true);
                  setRole('student');
                  setCurrentView('dashboard');
                }}
              />
            )}
            {currentView === 'editor' && (
              <AssessmentEditor 
                initialData={activeAssessment}
                onSave={async (savedAssessment) => {
                  if (!user) return;
                  try {
                    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assessments', savedAssessment.id), savedAssessment);
                    setCurrentView('dashboard');
                  } catch (error) {
                    console.error("Erro ao salvar avaliação:", error);
                  }
                }}
                onCancel={() => setCurrentView('dashboard')}
              />
            )}
            {currentView === 'report' && (
              <TeacherReport 
                assessment={activeAssessment} 
                submissions={submissions.filter(s => s.assessmentId && String(s.assessmentId) === String(activeAssessment.id))}
                onBack={() => setCurrentView('dashboard')}
              />
            )}
          </>
        ) : (
          <>
            {currentView === 'dashboard' && (
              <StudentDashboard 
                assessments={assessments.filter(a => a.published)} 
                onStart={(a) => { setActiveAssessment(a); setCurrentView('taker'); }}
              />
            )}
            {currentView === 'taker' && (
              <AssessmentTaker 
                assessment={activeAssessment}
                onSubmit={async (result) => {
                  if (!user) return;
                  try {
                    const resultId = Date.now().toString() + Math.random().toString(36).substring(7);
                    const finalResult = { ...result, id: resultId };
                    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'submissions', resultId), finalResult);
                    
                    setActiveAssessment(finalResult); 
                    setCurrentView('student_result');
                  } catch (error) {
                    console.error("Erro ao enviar avaliação:", error);
                  }
                }}
                onCancel={() => setCurrentView('dashboard')}
              />
            )}
            {currentView === 'student_result' && (
              <StudentResult 
                result={activeAssessment}
                onBack={() => setCurrentView('dashboard')}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function TeacherDashboard({ assessments, onEdit, onCreate, onViewReports, onDelete, onSimulateStudent }) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // Evita alert/confirm nativos
  const studentUrl = `${window.location.href.split('#')[0].split('?')[0]}#student`;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Painel do Professor</h2>
          <p className="text-gray-500">Gira as suas provas e exercícios salvos na nuvem.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button 
            onClick={onSimulateStudent}
            className="px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm bg-gray-900 text-white hover:bg-gray-800"
            title="Testar a visão do aluno sem abrir nova aba"
          >
            <Users size={20} />
            Simular Aluno
          </button>
          <button 
            onClick={() => setShowLinkModal(true)}
            className="px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300"
          >
            <Share2 size={20} />
            Link para Alunos
          </button>
          <button 
            onClick={onCreate}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Plus size={20} />
            Nova Avaliação
          </button>
        </div>
      </div>

      {assessments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhuma avaliação criada</h3>
          <p className="text-gray-500 mt-1">Clique em "Nova Avaliação" para começar.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map(assessment => (
            <div key={assessment.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${assessment.type === 'prova' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {assessment.type.toUpperCase()}
                </span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-md ${assessment.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {assessment.published ? 'Publicada' : 'Rascunho'}
                </span>
              </div>
              
              <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{assessment.title}</h3>
              <p className="text-sm text-gray-500 mb-4 flex-grow">{assessment.className} • {new Date(assessment.date).toLocaleDateString('pt-PT')}</p>
              
              <div className="text-sm text-gray-600 mb-6 bg-gray-50 p-2 rounded-lg flex justify-between items-center">
                <span>Questões: <strong>{assessment.questions?.length || 0}</strong></span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-auto">
                <button 
                  onClick={() => onEdit(assessment)}
                  className="px-2 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                >
                  <Settings size={16} /> Editar
                </button>
                <button 
                  onClick={() => onViewReports(assessment)}
                  className="px-2 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                >
                  <BarChart3 size={16} /> Notas
                </button>
                
                {deletingId === assessment.id ? (
                  <div className="flex gap-1 col-span-1">
                    <button 
                      onClick={() => { onDelete(assessment.id); setDeletingId(null); }}
                      className="px-2 py-1 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 flex-1"
                    >
                      Sim
                    </button>
                    <button 
                      onClick={() => setDeletingId(null)}
                      className="px-2 py-1 text-xs font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 flex-1"
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setDeletingId(assessment.id)}
                    className="px-2 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Explicativo do Link */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Info className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Como partilhar a prova</h3>
                <p className="text-sm text-gray-500">Atenção ao ambiente de testes</p>
              </div>
            </div>
            
            <div className="space-y-4 text-gray-700">
              <p>
                Quando esta aplicação for publicada num servidor real, este será o link que irá partilhar com os seus alunos (via WhatsApp, Teams, etc):
              </p>
              
              <div className="bg-gray-100 p-3 rounded-xl border border-gray-200 font-mono text-sm break-all">
                {studentUrl}
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                <h4 className="font-bold text-red-800 mb-1 flex items-center gap-2">
                  <AlertCircle size={18}/> Erro 404 Explicado
                </h4>
                <p className="text-sm text-red-700">
                  Como estamos dentro do ambiente de testes privado da Google, <strong>este link vai dar erro 404 se o abrir num novo separador agora</strong>. A Google bloqueia separadores externos por segurança.
                </p>
              </div>

              <p className="text-sm font-medium pt-2">
                Para testar agora mesmo a experiência do aluno sem sair deste ecrã, utilize o botão abaixo:
              </p>
            </div>
            
            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <button 
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 rounded-xl font-medium text-gray-600 hover:bg-gray-100"
              >
                Voltar
              </button>
              <button 
                onClick={() => {
                  setShowLinkModal(false);
                  onSimulateStudent();
                }}
                className="bg-gray-900 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-gray-800"
              >
                <Users size={18} />
                Simular Aluno Aqui
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AssessmentEditor({ initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    id: Date.now().toString(),
    title: '',
    date: new Date().toISOString().split('T')[0],
    className: '',
    type: 'prova',
    published: false,
    questions: []
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiQuestionCount, setAiQuestionCount] = useState(1);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiError, setAiError] = useState('');

  const addEmptyQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, {
        id: Date.now().toString(),
        text: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        feedback: ''
      }]
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].options[optIndex] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(index, 1);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setAiError('');
    try {
      const generatedQs = await generateQuestionsWithAI(aiTopic, aiQuestionCount);
      const questionsArray = Array.isArray(generatedQs) ? generatedQs : [generatedQs];
      
      const newQuestions = questionsArray.map((q, index) => ({
        ...q,
        id: Date.now().toString() + '-' + index
      }));

      setFormData({
        ...formData,
        questions: [...formData.questions, ...newQuestions]
      });
      setShowAiModal(false);
      setAiTopic('');
      setAiQuestionCount(1);
    } catch (error) {
      setAiError("Ocorreu um erro ao gerar as questões. Tente novamente.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ChevronRight className="rotate-180 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{initialData ? 'Editar Avaliação' : 'Nova Avaliação'}</h2>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-lg font-bold border-b pb-2 mb-4">Configurações Gerais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Título da Avaliação</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
              placeholder="Ex: Prova Mensal de Matemática"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Turma</label>
            <input 
              type="text" 
              value={formData.className} 
              onChange={e => setFormData({...formData, className: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
              placeholder="Ex: 3º Ano A"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Data de Aplicação</label>
            <input 
              type="date" 
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Tipo</label>
            <select 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
            >
              <option value="prova">Prova</option>
              <option value="exercicio">Exercício de Fixação</option>
            </select>
          </div>
        </div>
        <div className="pt-4 flex items-center gap-2">
          <input 
            type="checkbox" 
            id="published" 
            checked={formData.published}
            onChange={e => setFormData({...formData, published: e.target.checked})}
            className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-400"
          />
          <label htmlFor="published" className="font-medium text-gray-700 cursor-pointer">
            Publicar avaliação (visível para os alunos)
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-900">Questões ({formData.questions.length})</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAiModal(true)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all text-sm"
            >
              <Sparkles size={16} className="text-yellow-400" />
              Gerar com IA
            </button>
            <button 
              onClick={addEmptyQuestion}
              className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all text-sm"
            >
              <Plus size={16} />
              Adicionar Manual
            </button>
          </div>
        </div>

        {formData.questions.map((q, qIndex) => (
          <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative animate-in slide-in-from-bottom-2">
            <button 
              onClick={() => removeQuestion(qIndex)}
              className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remover Questão"
            >
              <Trash2 size={18} />
            </button>
            
            <div className="flex items-start gap-3 mb-4">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-gray-900 font-bold rounded-full flex items-center justify-center">
                {qIndex + 1}
              </span>
              <div className="flex-grow space-y-2 pr-8">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Enunciado</label>
                <textarea 
                  value={q.text} 
                  onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none min-h-[80px]"
                  placeholder="Digite a pergunta aqui..."
                />
              </div>
            </div>

            <div className="ml-11 space-y-3">
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider block mb-1">Alternativas</label>
              {q.options.map((opt, optIndex) => (
                <div key={optIndex} className={`flex items-center gap-3 p-2 rounded-lg border ${q.correctOptionIndex === optIndex ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <input 
                    type="radio" 
                    name={`correct-${q.id}`} 
                    checked={q.correctOptionIndex === optIndex}
                    onChange={() => handleQuestionChange(qIndex, 'correctOptionIndex', optIndex)}
                    className="w-5 h-5 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={opt} 
                    onChange={e => handleOptionChange(qIndex, optIndex, e.target.value)}
                    className="flex-grow p-2 bg-transparent outline-none border-b border-transparent focus:border-gray-300"
                    placeholder={`Opção ${String.fromCharCode(65 + optIndex)}`}
                  />
                </div>
              ))}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider block mb-2">Feedback (Opcional)</label>
                <textarea 
                  value={q.feedback} 
                  onChange={e => handleQuestionChange(qIndex, 'feedback', e.target.value)}
                  className="w-full p-3 bg-blue-50/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                  placeholder="Explicação exibida ao aluno após a correção..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
        
        {formData.questions.length === 0 && (
          <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500">
            Nenhuma questão adicionada ainda.<br/>Use a IA ou adicione manualmente.
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-4xl mx-auto flex justify-end gap-3">
          <button onClick={onCancel} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100">
            Cancelar
          </button>
          <button 
            onClick={() => onSave(formData)}
            disabled={!formData.title}
            className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm"
          >
            <Save size={20} />
            Salvar Avaliação
          </button>
        </div>
      </div>

      {showAiModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center">
                <Sparkles className="text-yellow-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Assistente de IA</h3>
                <p className="text-sm text-gray-500">Gere questões instantaneamente.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Qual o tema da questão?</label>
                <textarea
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  placeholder="Ex: As leis de Newton aplicadas ao movimento circular..."
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 h-24 resize-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quantidade de questões (1 a 10):</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={aiQuestionCount}
                  onChange={e => setAiQuestionCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>
              
              {aiError && (
                 <div className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg">
                   {aiError}
                 </div>
              )}
              
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                  disabled={aiLoading}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAIGenerate}
                  disabled={aiLoading || !aiTopic.trim()}
                  className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-800 disabled:opacity-70"
                >
                  {aiLoading ? (
                    <><Loader2 size={18} className="animate-spin" /> Gerando...</>
                  ) : (
                    <><BrainCircuit size={18} /> Gerar {aiQuestionCount > 1 ? 'Questões' : 'Questão'}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeacherReport({ assessment, submissions, onBack }) {
  const averageScore = submissions.length 
    ? (submissions.reduce((acc, sub) => acc + Number(sub.score || 0), 0) / submissions.length).toFixed(1) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ChevronRight className="rotate-180 text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatório de Desempenho</h2>
          <p className="text-gray-500">{assessment.title} • {assessment.className}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total de Entregas</p>
            <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Média da Turma</p>
            <p className="text-2xl font-bold text-gray-900">{averageScore} / {assessment.questions?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-700">Submissões Detalhadas</h3>
        </div>
        {submissions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum aluno realizou esta avaliação ainda.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-sm text-gray-500">
                <th className="p-4 font-medium">Aluno</th>
                <th className="p-4 font-medium">Data/Hora</th>
                <th className="p-4 font-medium text-center">Acertos</th>
                <th className="p-4 font-medium text-center">Desempenho</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, i) => {
                const totalQuestions = assessment.questions?.length || 1;
                const percentage = (Number(sub.score || 0) / totalQuestions) * 100;
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">{sub.studentName}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(sub.timestamp).toLocaleString('pt-PT')}</td>
                    <td className="p-4 text-center font-bold">{sub.score} / {totalQuestions}</td>
                    <td className="p-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${percentage >= 70 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StudentDashboard({ assessments, onStart }) {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Área do Aluno</h2>
        <p className="text-gray-500">Escolha uma avaliação para iniciar.</p>
      </div>

      {assessments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhuma avaliação disponível</h3>
          <p className="text-gray-500 mt-1">Aguarde o professor publicar novas provas.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map(assessment => (
            <div key={assessment.id} className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-400 flex flex-col h-full hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => onStart(assessment)}>
              <div className="flex justify-between items-start mb-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${assessment.type === 'prova' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {assessment.type.toUpperCase()}
                </span>
                <span className="text-sm font-medium text-gray-400 flex items-center gap-1">
                  <FileText size={14}/> {assessment.questions.length} Q.
                </span>
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2 mt-2">{assessment.title}</h3>
              <p className="text-sm text-gray-600 mb-6">{assessment.className} • Professor GI</p>
              
              <button 
                className="mt-auto w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-yellow-400 hover:text-gray-900 transition-colors flex justify-center items-center gap-2"
              >
                Iniciar Agora <ChevronRight size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AssessmentTaker({ assessment, onSubmit, onCancel }) {
  const [studentName, setStudentName] = useState('');
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showError, setShowError] = useState(false);

  const handleSelectOption = (qIndex, optIndex) => {
    setShowError(false);
    setAnswers({ ...answers, [qIndex]: optIndex });
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < assessment.questions.length) {
      setShowError(true);
      return;
    }

    let score = 0;
    const gradedAnswers = assessment.questions.map((q, index) => {
      const selected = answers[index];
      const isCorrect = selected === q.correctOptionIndex;
      if (isCorrect) score++;
      return {
        question: q,
        selectedOptionIndex: selected,
        isCorrect: isCorrect
      };
    });

    const result = {
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      studentName: studentName.trim() || 'Aluno Anónimo',
      score: score,
      totalQuestions: assessment.questions.length,
      gradedAnswers: gradedAnswers,
      timestamp: new Date().toISOString()
    };

    onSubmit(result);
  };

  if (!started) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center animate-in zoom-in-95">
        <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="text-gray-900" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{assessment.title}</h2>
        <p className="text-gray-500 mb-6">{assessment.questions.length} questões • {assessment.type === 'prova' ? 'Prova' : 'Exercício'}</p>
        
        <div className="space-y-4 mb-8 text-left">
          <label className="block text-sm font-semibold text-gray-700">O Seu Nome Completo:</label>
          <input 
            type="text" 
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
            placeholder="Digite o seu nome para começar..."
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-0 outline-none text-lg font-medium transition-colors"
          />
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => setStarted(true)}
            disabled={!studentName.trim()}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-lg transition-colors"
          >
            Começar Avaliação
          </button>
          <button 
            onClick={onCancel}
            className="w-full text-gray-500 hover:text-gray-900 font-medium py-2 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="bg-gray-900 text-white p-6 rounded-t-3xl sticky top-16 z-40 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{assessment.title}</h2>
            <p className="text-gray-400 text-sm">Aluno: {studentName}</p>
          </div>
          <div className="text-right">
            <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full font-bold text-sm">
              Progresso: {Object.keys(answers).length} / {assessment.questions.length}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border-x border-b border-gray-100 rounded-b-3xl p-6 md:p-8 space-y-12">
        {assessment.questions.map((q, qIndex) => (
          <div key={q.id} className="space-y-6 scroll-mt-24" id={`question-${qIndex}`}>
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-sm">
                  {qIndex + 1}
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-medium text-gray-900 leading-relaxed">
                {q.text}
              </h3>
            </div>

            <div className="pl-12 space-y-3">
              {q.options.map((opt, optIndex) => {
                const isSelected = answers[qIndex] === optIndex;
                return (
                  <label 
                    key={optIndex} 
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-yellow-400 bg-yellow-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name={`q-${qIndex}`} 
                      checked={isSelected}
                      onChange={() => handleSelectOption(qIndex, optIndex)}
                      className="w-5 h-5 text-yellow-500 focus:ring-yellow-400 border-gray-300"
                    />
                    <span className={`text-base ${isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {opt}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-3xl mx-auto flex justify-between items-center gap-4">
           {showError ? (
             <span className="text-sm font-bold text-red-500 animate-pulse bg-red-50 p-2 rounded-lg">
               Por favor, responda a todas as questões para enviar.
             </span>
           ) : (
             <span className="text-sm font-medium text-gray-500 hidden sm:inline-block">
               Reveja as suas respostas antes de enviar.
             </span>
           )}
          <button 
            onClick={handleSubmit}
            className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 rounded-xl font-bold flex justify-center items-center gap-2 shadow-sm text-lg"
          >
            Finalizar e Enviar
            <CheckCircle2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentResult({ result, onBack }) {
  const percentage = (result.score / result.totalQuestions) * 100;
  
  let resultMsg = { title: '', color: '', bg: '' };
  if (percentage >= 70) {
    resultMsg = { title: 'Excelente Trabalho!', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2 };
  } else if (percentage >= 50) {
    resultMsg = { title: 'Bom, mas pode melhorar!', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertCircle };
  } else {
    resultMsg = { title: 'Precisa de estudar mais.', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle };
  }

  const Icon = resultMsg.icon;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in slide-in-from-bottom-4">
      <div className="bg-white rounded-3xl p-8 text-center shadow-lg border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-900"></div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Resultado da Avaliação</h2>
        <p className="text-gray-500 mb-8">{result.assessmentTitle} • Aluno: {result.studentName}</p>
        
        <div className="flex flex-col items-center justify-center">
          <div className={`w-32 h-32 rounded-full ${resultMsg.bg} flex items-center justify-center mb-6 relative`}>
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200" />
              <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="377" strokeDashoffset={377 - (377 * percentage) / 100} className={resultMsg.color.replace('text-', 'text-')} />
            </svg>
            <div className="text-center">
              <span className="text-4xl font-black text-gray-900 block leading-none">{result.score}</span>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">de {result.totalQuestions}</span>
            </div>
          </div>
          <div className={`flex items-center gap-2 ${resultMsg.color} font-bold text-xl`}>
            <Icon /> {resultMsg.title}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-xl text-gray-900 px-2">Correção Detalhada</h3>
        
        {result.gradedAnswers.map((item, index) => (
          <div key={index} className={`bg-white rounded-2xl p-6 border-l-4 shadow-sm ${item.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
            <div className="flex gap-4 mb-4">
              <div className="flex-shrink-0 mt-1">
                 {item.isCorrect ? (
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <CheckCircle2 size={20} />
                    </div>
                 ) : (
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                      <XCircle size={20} />
                    </div>
                 )}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-lg mb-4">{index + 1}. {item.question.text}</p>
                
                <div className="space-y-2">
                  {item.question.options.map((opt, optIdx) => {
                    let style = "border-gray-200 text-gray-600";
                    let icon = null;
                    
                    if (optIdx === item.question.correctOptionIndex) {
                      style = "border-green-500 bg-green-50 text-green-800 font-medium";
                      icon = <CheckCircle2 size={16} className="text-green-500 ml-auto" />;
                    } else if (optIdx === item.selectedOptionIndex && !item.isCorrect) {
                      style = "border-red-500 bg-red-50 text-red-800";
                      icon = <XCircle size={16} className="text-red-500 ml-auto" />;
                    } else if (optIdx === item.selectedOptionIndex && item.isCorrect) {
                       style = "border-green-500 bg-green-50 text-green-800 font-medium";
                    }

                    return (
                      <div key={optIdx} className={`p-3 rounded-lg border flex items-center gap-2 ${style}`}>
                        <span className="w-6 h-6 rounded bg-white border border-current flex items-center justify-center text-xs font-bold">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        {opt}
                        {icon}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {item.question.feedback && (
              <div className="ml-12 mt-4 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm leading-relaxed flex gap-3 items-start">
                <BrainCircuit size={20} className="flex-shrink-0 text-blue-500 mt-0.5" />
                <div>
                  <strong className="block mb-1">Feedback do Professor:</strong>
                  {item.question.feedback}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center pt-8">
        <button 
          onClick={onBack}
          className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-bold inline-flex items-center gap-2"
        >
          <LogOut size={18} className="rotate-180" />
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}
