function GetStartedModal({ onClose, onSelect }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="get-started-title" className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Welcome to PayWise</p>
            <h2 id="get-started-title" className="mt-2 text-2xl font-bold tracking-tight">Let's get started</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">Choose how you'd like to continue.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg px-2 py-1 text-xl text-neutral-500 hover:bg-neutral-100 hover:text-black">×</button>
        </div>
        <div className="mt-6 grid gap-3">
          <button onClick={() => onSelect('signin')} className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800">Sign In</button>
          <button onClick={() => onSelect('signup')} className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-neutral-100">Create an Account</button>
        </div>
        <p className="mt-5 text-center text-xs text-neutral-500">Your finances, clearly organized.</p>
      </section>
    </div>
  );
}

export default GetStartedModal;
