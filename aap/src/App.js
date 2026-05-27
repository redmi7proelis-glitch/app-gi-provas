import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut 
} from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';
import { 
  BookOpen, Plus, Settings, Users, BrainCircuit, 
  Save, Trash2, CheckCircle2, XCircle, FileText, 
  BarChart3, ChevronRight, LogOut, Loader2, Sparkles, AlertCircle, Share2
} from 'lucide-react';

// Configuração injetada pelo ambiente (substitua pelas suas credenciais reais do Firebase se necessário)
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('teacher');
  const [assessments, setAssessments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeAssessment, setActiveAssessment] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Dados isolados por UID do utilizador
  useEffect(() => {
    if (!user) return;
    
    const assessmentsRef = collection(db, 'assessments');
    const q = query(assessmentsRef, where("teacherId", "==", user.uid));
    
    return onSnapshot(q, (snapshot) => {
      setAssessments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [user]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erro no login:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-yellow-400 rounded-2xl mx-auto flex items-center justify-center text-3xl font-black mb-6">GI</div>
          <h1 className="text-2xl font-bold mb-2">Bem-vindo ao GI Provas</h1>
          <p className="text-gray-500 mb-8">Faça login com Google para gerir as suas turmas.</p>
          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <header className="bg-gray-900 text-white shadow-lg p-4 flex justify-between items-center">
        <h1 className="font-bold">APP GI PROVAS</h1>
        <button onClick={() => signOut(auth)} className="text-sm text-gray-400 hover:text-white">Sair</button>
      </header>
      
      <main className="p-6">
        <TeacherDashboard 
            assessments={assessments}
            onCreate={() => { setActiveAssessment(null); setCurrentView('editor'); }}
        />
      </main>
    </div>
  );
}

function TeacherDashboard({ assessments, onCreate }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Painel do Professor</h2>
        <button onClick={onCreate} className="bg-yellow-400 px-4 py-2 rounded-lg font-bold">Nova Prova</button>
      </div>
      <div className="grid gap-4">
        {assessments.map(a => (
          <div key={a.id} className="bg-white p-4 rounded-xl shadow-sm border">{a.title}</div>
        ))}
      </div>
    </div>
  );
}
