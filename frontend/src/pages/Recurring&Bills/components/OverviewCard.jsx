export default function OverviewCard({ title, value, extra, description, className = "" }) {
  return (
    <article className={`rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 ${className}`}>
      <h2 className="text-sm font-medium text-neutral-500">{title}</h2>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl tabular-nums">
          {value}
        </span>
        {extra && (
          <span className="text-xs font-normal text-neutral-500 sm:text-sm">
            {extra}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-2 text-xs text-neutral-500">
          {description}
        </p>
      )}
    </article>
  );
}
