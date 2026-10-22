function Icon({ name, className = 'h-6 w-6' }) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const drawings = {
    coins: <><ellipse cx="9" cy="5" rx="5" ry="2.5" /><path d="M4 5v4c0 1.4 2.2 2.5 5 2.5 .8 0 1.5-.1 2.2-.3" /><path d="M4 9v4c0 1.4 2.2 2.5 5 2.5 1 0 1.9-.2 2.7-.5" /><ellipse cx="15" cy="12" rx="5" ry="2.5" /><path d="M10 12v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4" /><path d="M10 16v3c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-3" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M12 13v5M9.5 15.5h5" /></>,
    chart: <><path d="M3 20h18" /><rect x="5" y="11" width="3" height="7" rx="1" /><rect x="11" y="7" width="3" height="11" rx="1" /><rect x="17" y="3" width="3" height="15" rx="1" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    receipt: <><path d="M6 3h8l5 5v13l-3-2-3 2-3-2-4 2z" /><path d="M14 3v5h5M9 12h6M9 15h4" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M9 21v-7h6v7" /></>,
    list: <><path d="M9 6h12M9 12h12M9 18h12" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 9h18M16 14h2" /></>,
  };

  return <svg {...common}>{drawings[name] || drawings.chart}</svg>;
}

export default Icon;
