import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Language } from './types';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import { Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';

// --- Contexts ---

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: any, data: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Providers ---

const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          avatar_url: `https://ui-avatars.com/api/?name=${fullName}&background=random`
        }
      }
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('fr');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
};

// --- Hooks ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};

// --- Protected Route ---
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary-600" /></div>;
  if (!user) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

// --- Main App ---

const AppContent = () => {
  const location = useLocation();
  const isEditor = location.pathname.includes('/editor');

  return (
    <div className="min-h-screen flex flex-col">
      {!isEditor && <Navbar />}
      <main className={`flex-grow ${!isEditor ? 'pt-16' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/editor/:id?" 
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <AppProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </AppProvider>
    </HashRouter>
  );
};

export default App;