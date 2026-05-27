import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Settings,
  Users,
  BrainCircuit,
  Save,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  BarChart3,
  ChevronRight,
  LogOut,
  Loader2,
  Sparkles,
  AlertCircle,
  Share2,
  Check,
  Info,
} from "lucide-react";

const INITIAL_ASSESSMENTS = [
  {
    id: "1",
    title: "Avaliação de História - 1º Bimestre",
    date: "2026-06-10",
    className: "Turma 101 - Manhã",
    type: "prova",
    published: true,
    questions: [
      {
        id: "q1",
        text: "Qual foi o principal motivo para a Revolução Francesa?",
        options: [
          "A descoberta de novas terras na América.",
          "A insatisfação popular com a monarquia absolutista e a crise económica.",
          "A invenção da máquina a vapor.",
          "O fim do Império Romano.",
        ],
        correctOptionIndex: 1,
        feedback:
          "A Revolução Francesa foi impulsionada pela desigualdade social e crise económica sob o regime de Luís XVI.",
      },
    ],
  },
];

export default function App() {
  const [role, setRole] = useState(() => {
    return window.location.hash.includes("student") ? "student" : "teacher";
  });
  const [isStudentLink, setIsStudentLink] = useState(() => {
    return window.location.hash.includes("student");
  });

  // Usando LocalStorage em vez de Firebase para funcionar sem chaves complexas
  const [assessments, setAssessments] = useState(() => {
    const saved = localStorage.getItem("gi-provas-assessments");
    return saved ? JSON.parse(saved) : INITIAL_ASSESSMENTS;
  });

  const [submissions, setSubmissions] = useState(() => {
    const saved = localStorage.getItem("gi-provas-submissions");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentView, setCurrentView] = useState("dashboard");
  const [activeAssessment, setActiveAssessment] = useState(null);

  // Guarda alterações automaticamente no navegador (sem Firebase)
  useEffect(() => {
    localStorage.setItem("gi-provas-assessments", JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem("gi-provas-submissions", JSON.stringify(submissions));
  }, [submissions]);

  // Função para lidar com mudanças de rota baseadas no Hash URL (#student)
  useEffect(() => {
    const handleHashChange = () => {
      const isStudent = window.location.hash.includes("student");
      setIsStudentLink(isStudent);
      setRole(isStudent ? "student" : "teacher");
      setCurrentView("dashboard");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const renderHeader = () => (
    <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setCurrentView("dashboard")}
        >
          <div className="w-10 h-10 bg-yellow-400 text-gray-900 font-black flex items-center justify-center rounded-lg text-xl tracking-tighter">
            GI
          </div>
          <h1 className="font-bold text-xl tracking-wide hidden sm:block">
            APP <span className="text-yellow-400">GI PROVAS</span>
          </h1>
        </div>

        {!isStudentLink && (
          <div className="flex items-center gap-4">
            <div className="bg-gray-800 p-1 rounded-lg flex text-sm font-medium">
              <button
                onClick={() => {
                  setRole("teacher");
                  setCurrentView("dashboard");
                }}
                className={`px-4 py-1.5 rounded-md transition-colors ${
                  role === "teacher"
                    ? "bg-yellow-400 text-gray-900"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Professor
              </button>
              <button
                onClick={() => {
                  setRole("student");
                  setCurrentView("dashboard");
                }}
                className={`px-4 py-1.5 rounded-md transition-colors ${
                  role === "student"
                    ? "bg-yellow-400 text-gray-900"
                    : "text-gray-400 hover:text-white"
                }`}
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
        {role === "teacher" ? (
          <>
            {currentView === "dashboard" && (
              <TeacherDashboard
                assessments={assessments}
                onEdit={(a) => {
                  setActiveAssessment(a);
                  setCurrentView("editor");
                }}
                onCreate={() => {
                  setActiveAssessment(null);
                  setCurrentView("editor");
                }}
                onViewReports={(a) => {
                  setActiveAssessment(a);
                  setCurrentView("report");
                }}
                onDelete={(id) => {
                  setAssessments(assessments.filter((a) => a.id !== id));
                }}
              />
            )}
            {currentView === "editor" && (
              <AssessmentEditor
                initialData={activeAssessment}
                onSave={(savedAssessment) => {
                  if (activeAssessment) {
                    setAssessments(
                      assessments.map((a) =>
                        a.id === savedAssessment.id ? savedAssessment : a
                      )
                    );
                  } else {
                    setAssessments([...assessments, savedAssessment]);
                  }
                  setCurrentView("dashboard");
                }}
                onCancel={() => setCurrentView("dashboard")}
              />
            )}
            {currentView === "report" && (
              <TeacherReport
                assessment={activeAssessment}
                submissions={submissions.filter(
                  (s) => s.assessmentId === activeAssessment.id
                )}
                onBack={() => setCurrentView("dashboard")}
              />
            )}
          </>
        ) : (
          <>
            {currentView === "dashboard" && (
              <StudentDashboard
                assessments={assessments.filter((a) => a.published)}
                onStart={(a) => {
                  setActiveAssessment(a);
                  setCurrentView("taker");
                }}
              />
            )}
            {currentView === "taker" && (
              <AssessmentTaker
                assessment={activeAssessment}
                onSubmit={(result) => {
                  const resultId =
                    Date.now().toString() +
                    Math.random().toString(36).substring(7);
                  const finalResult = { ...result, id: resultId };
                  setSubmissions([...submissions, finalResult]);
                  setActiveAssessment(finalResult);
                  setCurrentView("student_result");
                }}
                onCancel={() => setCurrentView("dashboard")}
              />
            )}
            {currentView === "student_result" && (
              <StudentResult
                result={activeAssessment}
                onBack={() => setCurrentView("dashboard")}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function TeacherDashboard({
  assessments,
  onEdit,
  onCreate,
  onViewReports,
  onDelete,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    // Pega a URL atual gerada pelo CodeSandbox/Vercel e adiciona a hash do aluno
    const currentUrl = window.location.href.split("#")[0].split("?")[0];
    const studentUrl = `${currentUrl}#student`;

    // Tenta copiar para a área de transferência usando API moderna primeiro
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(studentUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
    } else {
      // Fallback para navegadores antigos
      const textArea = document.createElement("textarea");
      textArea.value = studentUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error("Erro ao copiar", err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleSimulateStudent = () => {
    window.location.hash = "student"; // Ativa a visão de aluno alterando a URL
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Painel do Professor
          </h2>
          <p className="text-gray-500">
            Gira as suas provas e exercícios salvos.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={handleSimulateStudent}
            className="px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm bg-gray-900 text-white hover:bg-gray-800"
            title="Testar a visão do aluno sem abrir nova aba"
          >
            <Users size={20} />
            Simular Aluno
          </button>
          <button
            onClick={handleCopyLink}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
              copied
                ? "bg-green-100 text-green-700"
                : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300"
            }`}
          >
            {copied ? <Check size={20} /> : <Share2 size={20} />}
            {copied ? "Link Copiado!" : "Link para Alunos"}
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
          <h3 className="text-lg font-medium text-gray-900">
            Nenhuma avaliação criada
          </h3>
          <p className="text-gray-500 mt-1">
            Clique em "Nova Avaliação" para começar.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    assessment.type === "prova"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {assessment.type.toUpperCase()}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-md ${
                    assessment.published
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {assessment.published ? "Publicada" : "Rascunho"}
                </span>
              </div>

              <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">
                {assessment.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4 flex-grow">
                {assessment.className} •{" "}
                {new Date(assessment.date).toLocaleDateString("pt-PT")}
              </p>

              <div className="text-sm text-gray-600 mb-6 bg-gray-50 p-2 rounded-lg flex justify-between items-center">
                <span>
                  Questões: <strong>{assessment.questions?.length || 0}</strong>
                </span>
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
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Tem a certeza que deseja excluir esta prova?"
                      )
                    )
                      onDelete(assessment.id);
                  }}
                  className="px-2 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 size={16} /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AssessmentEditor({ initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState(
    initialData || {
      id: Date.now().toString(),
      title: "",
      date: new Date().toISOString().split("T")[0],
      className: "",
      type: "prova",
      published: false,
      questions: [],
    }
  );

  const addEmptyQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          id: Date.now().toString(),
          text: "",
          options: ["", "", "", ""],
          correctOptionIndex: 0,
          feedback: "",
        },
      ],
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ChevronRight className="rotate-180 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {initialData ? "Editar Avaliação" : "Nova Avaliação"}
        </h2>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-lg font-bold border-b pb-2 mb-4">
          Configurações Gerais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Título da Avaliação
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
              placeholder="Ex: Prova Mensal de Matemática"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Turma</label>
            <input
              type="text"
              value={formData.className}
              onChange={(e) =>
                setFormData({ ...formData, className: e.target.value })
              }
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
              placeholder="Ex: 3º Ano A"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Data de Aplicação
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Tipo</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
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
            onChange={(e) =>
              setFormData({ ...formData, published: e.target.checked })
            }
            className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-400"
          />
          <label
            htmlFor="published"
            className="font-medium text-gray-700 cursor-pointer"
          >
            Publicar avaliação (visível para os alunos)
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-900">
            Questões ({formData.questions.length})
          </h3>
          <div className="flex gap-2">
            {/* O botão IA foi ocultado temporariamente no CodeSandbox, pois requer chaves de servidor. 
                Pode ser reativado facilmente num ambiente com Backend (Node.js). */}
            <button
              onClick={addEmptyQuestion}
              className="bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all text-sm"
            >
              <Plus size={16} />
              Adicionar Questão Manual
            </button>
          </div>
        </div>

        {formData.questions.map((q, qIndex) => (
          <div
            key={q.id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative animate-in slide-in-from-bottom-2"
          >
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
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Enunciado
                </label>
                <textarea
                  value={q.text}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "text", e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none min-h-[80px]"
                  placeholder="Digite a pergunta aqui..."
                />
              </div>
            </div>

            <div className="ml-11 space-y-3">
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Alternativas
              </label>
              {q.options.map((opt, optIndex) => (
                <div
                  key={optIndex}
                  className={`flex items-center gap-3 p-2 rounded-lg border ${
                    q.correctOptionIndex === optIndex
                      ? "border-green-400 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctOptionIndex === optIndex}
                    onChange={() =>
                      handleQuestionChange(
                        qIndex,
                        "correctOptionIndex",
                        optIndex
                      )
                    }
                    className="w-5 h-5 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) =>
                      handleOptionChange(qIndex, optIndex, e.target.value)
                    }
                    className="flex-grow p-2 bg-transparent outline-none border-b border-transparent focus:border-gray-300"
                    placeholder={`Opção ${String.fromCharCode(65 + optIndex)}`}
                  />
                </div>
              ))}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Feedback (Opcional)
                </label>
                <textarea
                  value={q.feedback}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "feedback", e.target.value)
                  }
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
            Nenhuma questão adicionada ainda.
            <br />
            Clique em "Adicionar Questão Manual" acima.
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-4xl mx-auto flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100"
          >
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
    </div>
  );
}

function TeacherReport({ assessment, submissions, onBack }) {
  const averageScore = submissions.length
    ? (
        submissions.reduce((acc, sub) => acc + sub.score, 0) /
        submissions.length
      ).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ChevronRight className="rotate-180 text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Relatório de Desempenho
          </h2>
          <p className="text-gray-500">
            {assessment.title} • {assessment.className}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Total de Entregas
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {submissions.length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Média da Turma</p>
            <p className="text-2xl font-bold text-gray-900">
              {averageScore} / {assessment.questions.length}
            </p>
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
                const percentage =
                  (sub.score / assessment.questions.length) * 100;
                return (
                  <tr
                    key={i}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="p-4 font-medium text-gray-900">
                      {sub.studentName}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(sub.timestamp).toLocaleString("pt-PT")}
                    </td>
                    <td className="p-4 text-center font-bold">
                      {sub.score} / {assessment.questions.length}
                    </td>
                    <td className="p-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            percentage >= 70
                              ? "bg-green-500"
                              : percentage >= 50
                              ? "bg-yellow-400"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
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
          <h3 className="text-lg font-medium text-gray-900">
            Nenhuma avaliação disponível
          </h3>
          <p className="text-gray-500 mt-1">
            Aguarde o professor publicar novas provas.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-400 flex flex-col h-full hover:-translate-y-1 transition-transform cursor-pointer"
              onClick={() => onStart(assessment)}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    assessment.type === "prova"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {assessment.type.toUpperCase()}
                </span>
                <span className="text-sm font-medium text-gray-400 flex items-center gap-1">
                  <FileText size={14} /> {assessment.questions.length} Q.
                </span>
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2 mt-2">
                {assessment.title}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {assessment.className} • Professor GI
              </p>

              <button className="mt-auto w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-yellow-400 hover:text-gray-900 transition-colors flex justify-center items-center gap-2">
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
  const [studentName, setStudentName] = useState("");
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
        isCorrect: isCorrect,
      };
    });

    const result = {
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      studentName: studentName.trim() || "Aluno Anónimo",
      score: score,
      totalQuestions: assessment.questions.length,
      gradedAnswers: gradedAnswers,
      timestamp: new Date().toISOString(),
    };

    onSubmit(result);
  };

  if (!started) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center animate-in zoom-in-95">
        <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="text-gray-900" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {assessment.title}
        </h2>
        <p className="text-gray-500 mb-6">
          {assessment.questions.length} questões •{" "}
          {assessment.type === "prova" ? "Prova" : "Exercício"}
        </p>

        <div className="space-y-4 mb-8 text-left">
          <label className="block text-sm font-semibold text-gray-700">
            O Seu Nome Completo:
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
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
              Progresso: {Object.keys(answers).length} /{" "}
              {assessment.questions.length}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border-x border-b border-gray-100 rounded-b-3xl p-6 md:p-8 space-y-12">
        {assessment.questions.map((q, qIndex) => (
          <div
            key={q.id}
            className="space-y-6 scroll-mt-24"
            id={`question-${qIndex}`}
          >
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
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${qIndex}`}
                      checked={isSelected}
                      onChange={() => handleSelectOption(qIndex, optIndex)}
                      className="w-5 h-5 text-yellow-500 focus:ring-yellow-400 border-gray-300"
                    />
                    <span
                      className={`text-base ${
                        isSelected
                          ? "font-medium text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
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

  let resultMsg = { title: "", color: "", bg: "" };
  if (percentage >= 70) {
    resultMsg = {
      title: "Excelente Trabalho!",
      color: "text-green-600",
      bg: "bg-green-100",
      icon: CheckCircle2,
    };
  } else if (percentage >= 50) {
    resultMsg = {
      title: "Bom, mas pode melhorar!",
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      icon: AlertCircle,
    };
  } else {
    resultMsg = {
      title: "Precisa de estudar mais.",
      color: "text-red-600",
      bg: "bg-red-100",
      icon: XCircle,
    };
  }

  const Icon = resultMsg.icon;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in slide-in-from-bottom-4">
      <div className="bg-white rounded-3xl p-8 text-center shadow-lg border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-900"></div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">
          Resultado da Avaliação
        </h2>
        <p className="text-gray-500 mb-8">
          {result.assessmentTitle} • Aluno: {result.studentName}
        </p>

        <div className="flex flex-col items-center justify-center">
          <div
            className={`w-32 h-32 rounded-full ${resultMsg.bg} flex items-center justify-center mb-6 relative`}
          >
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="60"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="60"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray="377"
                strokeDashoffset={377 - (377 * percentage) / 100}
                className={resultMsg.color.replace("text-", "text-")}
              />
            </svg>
            <div className="text-center">
              <span className="text-4xl font-black text-gray-900 block leading-none">
                {result.score}
              </span>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                de {result.totalQuestions}
              </span>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 ${resultMsg.color} font-bold text-xl`}
          >
            <Icon /> {resultMsg.title}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-xl text-gray-900 px-2">
          Correção Detalhada
        </h3>

        {result.gradedAnswers.map((item, index) => (
          <div
            key={index}
            className={`bg-white rounded-2xl p-6 border-l-4 shadow-sm ${
              item.isCorrect ? "border-green-500" : "border-red-500"
            }`}
          >
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
                <p className="font-medium text-gray-900 text-lg mb-4">
                  {index + 1}. {item.question.text}
                </p>

                <div className="space-y-2">
                  {item.question.options.map((opt, optIdx) => {
                    let style = "border-gray-200 text-gray-600";
                    let icon = null;

                    if (optIdx === item.question.correctOptionIndex) {
                      style =
                        "border-green-500 bg-green-50 text-green-800 font-medium";
                      icon = (
                        <CheckCircle2
                          size={16}
                          className="text-green-500 ml-auto"
                        />
                      );
                    } else if (
                      optIdx === item.selectedOptionIndex &&
                      !item.isCorrect
                    ) {
                      style = "border-red-500 bg-red-50 text-red-800";
                      icon = (
                        <XCircle size={16} className="text-red-500 ml-auto" />
                      );
                    } else if (
                      optIdx === item.selectedOptionIndex &&
                      item.isCorrect
                    ) {
                      style =
                        "border-green-500 bg-green-50 text-green-800 font-medium";
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-lg border flex items-center gap-2 ${style}`}
                      >
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
                <BrainCircuit
                  size={20}
                  className="flex-shrink-0 text-blue-500 mt-0.5"
                />
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
