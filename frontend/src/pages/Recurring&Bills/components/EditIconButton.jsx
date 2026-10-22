export default function EditIconButton({ onClick, className = "", children = "Edit" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-800 transition-colors hover:bg-neutral-100 hover:text-black ${className}`}
    >
      {children}
    </button>
  );
}
