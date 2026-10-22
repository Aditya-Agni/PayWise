import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import SignInPage from './pages/SignInPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';
import Transactions from './pages/Transactions/Transactions.jsx';
import RecurringPayments from './pages/Recurring&Bills/RecurringPayments.jsx';
import PayWiseIntelligence from './pages/Analytics/PayWiseIntelligence.jsx';
import GetStartedModal from './components/GetStartedModal.jsx';
import { clearSession, getCurrentUser } from './services/api.js';
import { useFinance } from './context/FinanceContext.jsx';



function PageLoader() {
  return <main className="grid min-h-screen place-items-center bg-white text-sm text-neutral-600">Loading PayWise…</main>;
}

function ProtectedRoute({ user, loading, children }) {
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/" replace />;
}

function PublicRoute({ user, loading, children }) {
  if (loading) return <PageLoader />;
  return user ? <Navigate to="/home" replace /> : children;
}

function LandingRoute() {
  const [showGetStarted, setShowGetStarted] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <LandingPage onGetStarted={() => setShowGetStarted(true)} />
      {showGetStarted && (
        <GetStartedModal
          onClose={() => setShowGetStarted(false)}
          onSelect={(choice) => navigate(choice === 'signin' ? '/signin' : '/signup')}
        />
      )}
    </>
  );
}

function ProtectedPlaceholder({ title }) {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-4 text-black">
      <section className="w-full max-w-lg rounded-2xl border border-neutral-200 p-8 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-sm text-neutral-600">This protected page is ready for its content.</p>
      </section>
    </main>
  );
}

function App() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshFinanceData } = useFinance();
  const currentUser = useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const handleAuthSuccess = useCallback(async (user) => {
    queryClient.setQueryData(['auth', 'current-user'], user);
    refreshFinanceData().catch(() => { });
    navigate('/home', { replace: true });
  }, [navigate, queryClient, refreshFinanceData]);

  const handleSignOut = useCallback(async () => {
    try {
      await clearSession();
    } finally {
      queryClient.removeQueries({ queryKey: ['auth', 'current-user'] });
      navigate('/', { replace: true });
    }
  }, [navigate, queryClient]);

  const authProps = { user: currentUser.data, loading: currentUser.isPending };

  return (
    <Routes>
      <Route path="/" element={<PublicRoute {...authProps}><LandingRoute /></PublicRoute>} />
      <Route path="/signin" element={<PublicRoute {...authProps}><SignInPage onSuccess={handleAuthSuccess} onNavigate={(page) => navigate(page === 'signup' ? '/signup' : '/signin')} onBack={() => navigate('/')} /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute {...authProps}><SignUpPage onSuccess={handleAuthSuccess} onNavigate={(page) => navigate(page === 'signin' ? '/signin' : '/signup')} onBack={() => navigate('/')} /></PublicRoute>} />
      <Route path="/home" element={<ProtectedRoute {...authProps}><HomePage user={currentUser.data} onSignOut={handleSignOut} /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute {...authProps}><Transactions user={currentUser.data} onSignOut={handleSignOut} /></ProtectedRoute>} />
      <Route path="/recurring-payments" element={<ProtectedRoute {...authProps}><RecurringPayments user={currentUser.data} onSignOut={handleSignOut} /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute {...authProps}><PayWiseIntelligence user={currentUser.data} onSignOut={handleSignOut} /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
