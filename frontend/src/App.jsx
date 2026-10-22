import { useState } from 'react';
import LandingPage from "./pages/LandingPage/LandingPage";
import SignInPage from './pages/SignInPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import GetStartedModal from './components/GetStartedModal.jsx';
import { clearSession } from './services/api.js';
import { useFinance } from './context/FinanceContext.jsx';

function App() {
  const [page, setPage] = useState('landing');
  const [showGetStarted, setShowGetStarted] = useState(false);
  const [signedInUser, setSignedInUser] = useState(null);
  const { refreshFinanceData } = useFinance();

  async function handleAuthSuccess(user) {
    setSignedInUser(user);
    await refreshFinanceData();
    setPage('dashboard');
  }

  function handleAuthChoice(choice) {
    setShowGetStarted(false);
    setPage(choice);
  }

  if (page === 'signin') {
    return <SignInPage onSuccess={handleAuthSuccess} onNavigate={setPage} onBack={() => setPage('landing')} />;
  }

  if (page === 'signup') {
    return <SignUpPage onSuccess={handleAuthSuccess} onNavigate={setPage} onBack={() => setPage('landing')} />;
  }

  if (page === 'dashboard') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4 text-black">
        <section className="w-full max-w-lg rounded-2xl border border-neutral-200 p-8">
          <p className="text-sm font-semibold text-neutral-500">PayWise</p>
          <h1 className="mt-3 text-2xl font-bold">You're signed in{signedInUser?.name ? `, ${signedInUser.name}` : ''}.</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Authentication is connected to the backend. The dashboard and finance screens are intentionally empty placeholders for the next development step.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => setPage('landing')} className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold hover:bg-neutral-100">Back to landing page</button>
            <button onClick={() => { clearSession(); setSignedInUser(null); setPage('landing'); }} className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800">Sign out</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <LandingPage onGetStarted={() => setShowGetStarted(true)} />
      {showGetStarted && <GetStartedModal onClose={() => setShowGetStarted(false)} onSelect={handleAuthChoice} />}
    </>
  );
}

export default App;
