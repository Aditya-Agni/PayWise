import Icon from "../../components/Icon.jsx";

function DashboardPreview() {
  const categories = [
    ['Food', '36%', 'w-[36%]'],
    ['Shopping', '22%', 'w-[22%]'],
    ['Bills', '18%', 'w-[18%]'],
    ['Travel', '12%', 'w-[12%]'],
    ['Others', '12%', 'w-[12%]'],
  ];
  const payments = [
    ['Spotify', '22 Oct 2026', '₹119.00', 'Due Today'],
    ['Tata Play', '25 Oct 2026', '₹699.00', 'Due Soon'],
    ['Home Loan EMI', '1 Nov 2026', '₹15,000.00', 'Upcoming'],
  ];
  const transactions = [
    ['Zomato', '₹450.00', '22 Oct'],
    ['Amazon', '₹1,299.00', '21 Oct'],
    ['Swiggy', '₹320.00', '19 Oct'],
    ['Tata Play', '₹699.00', '18 Oct'],
  ];

  return (
    <div className="relative mx-auto w-full max-w-[790px] pb-8 pt-2 sm:pt-6 lg:pt-0">
      {/* Laptop dashboard preview */}
      <div className="rounded-[18px] border-[7px] border-neutral-950 bg-neutral-950 p-[3px] shadow-2xl sm:border-[10px]">
        <div className="overflow-hidden rounded-[5px] bg-white">
          <div className="flex h-9 items-center justify-between border-b border-neutral-200 px-3 sm:h-11 sm:px-4">
            <span className="text-xs font-bold sm:text-sm">PayWise</span>
            <span className="flex items-center gap-2 text-[9px] sm:text-[10px]"><span className="grid h-5 w-5 place-items-center rounded-full bg-black text-white">R</span> Hi, Rohan</span>
          </div>
          <div className="grid min-h-[250px] grid-cols-[83px_1fr] sm:min-h-[335px] sm:grid-cols-[120px_1fr]">
            <aside className="space-y-1 border-r border-neutral-200 p-2 sm:p-3">
              {[
                ['home', 'Dashboard'], ['list', 'Transactions'], ['calendar', 'Recurring'], ['wallet', 'Settings'],
              ].map(([icon, label], index) => (
                <div key={label} className={`flex items-center gap-1.5 rounded-md px-1.5 py-2 text-[8px] sm:gap-2 sm:px-2 sm:text-[10px] ${index === 0 ? 'bg-neutral-100 font-semibold' : 'text-neutral-600'}`}>
                  <Icon name={icon} className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                  <span className="truncate">{label}</span>
                </div>
              ))}
            </aside>
            <div className="min-w-0 bg-neutral-50/60 p-2 sm:p-4">
              <h3 className="text-sm font-bold sm:text-xl">Dashboard</h3>
              <p className="mb-3 mt-1 text-[8px] text-neutral-500 sm:mb-4 sm:text-[10px]">Here's your financial overview</p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2.5">
                {[
                  ['₹24,850', 'Total Spending'], ['18', 'Transactions'], ['5', 'Active Payments'], ['3', 'Upcoming Payments'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-lg border border-neutral-200 bg-white p-2 sm:p-3">
                    <p className="truncate text-xs font-bold sm:text-base">{value}</p>
                    <p className="mt-1 truncate text-[7px] sm:text-[9px]">{label}</p>
                    <p className="mt-1 hidden text-[8px] text-neutral-500 sm:block">This month</p>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 grid grid-cols-1 gap-2 sm:mt-3 sm:grid-cols-2 sm:gap-3">
                <div className="rounded-lg border border-neutral-200 bg-white p-2 sm:p-3">
                  <h4 className="mb-3 text-[9px] font-semibold sm:text-[11px]">Spending by Category</h4>
                  <div className="space-y-2.5">
                    {categories.map(([label, percent, width]) => (
                      <div key={label} className="flex items-center gap-2 text-[8px] sm:text-[9px]">
                        <span className="w-12 shrink-0">{label}</span>
                        <div className="h-1.5 flex-1 rounded-full bg-neutral-100"><div className={`h-1.5 rounded-full bg-black ${width}`} /></div>
                        <span>{percent}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="hidden rounded-lg border border-neutral-200 bg-white p-3 sm:block">
                  <div className="mb-3 flex items-center justify-between"><h4 className="text-[11px] font-semibold">Upcoming Payments</h4><span className="text-[9px] text-neutral-500">View all</span></div>
                  <div className="space-y-3">
                    {payments.map(([name, date, amount, status]) => (
                      <div key={name} className="flex items-center justify-between gap-2 text-[9px]">
                        <div className="min-w-0"><p className="truncate font-semibold">{name}</p><p className="mt-1 text-neutral-500">{date}</p></div>
                        <div className="shrink-0 text-right"><p className="font-semibold">{amount}</p><p className="mt-1 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[8px] text-neutral-600">{status}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Laptop base */}
      <div className="mx-auto h-2 w-[108%] -translate-x-[4%] rounded-b-xl bg-neutral-400 sm:h-3" />
      <div className="mx-auto h-1 w-[22%] rounded-b-md bg-neutral-400" />

      {/* Phone preview */}
      <div className="absolute -bottom-2 right-0 hidden w-[145px] rounded-[27px] border-[6px] border-neutral-950 bg-neutral-950 p-[3px] shadow-xl lg:block xl:right-[-12px] xl:w-[165px]">
        <div className="overflow-hidden rounded-[19px] bg-white">
          <div className="mx-auto mt-1 h-3 w-14 rounded-full bg-black" />
          <div className="flex items-center justify-between border-b border-neutral-100 px-2.5 py-3"><span className="text-xs font-bold">PayWise</span><Icon name="menu" className="h-4 w-4" /></div>
          <div className="p-2.5">
            <div className="rounded-lg border border-neutral-100 p-2"><p className="text-[8px]">Total Spending</p><p className="mt-1 text-base font-bold">₹24,850</p><p className="text-[8px] text-neutral-500">This month</p></div>
            <p className="mb-2 mt-3 text-[9px] font-bold">Recent Transactions</p>
            {transactions.map(([name, amount, date]) => (
              <div key={name + date} className="flex items-center justify-between border-b border-neutral-100 py-2 text-[8px] last:border-0"><div><p className="font-semibold">{name}</p><p className="mt-0.5 text-neutral-500">{date} Oct</p></div><span className="font-semibold">{amount}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPreview;
