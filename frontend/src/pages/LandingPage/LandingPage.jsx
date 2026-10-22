import Icon from "../../components/Icon.jsx";   
import DashboardPreview from "../Dashboard/DashboardPreview.jsx";
// import Features from "./Features";
// import About from "./About";
// import HowItWorks from "./HowItWorks";

const features = [
  { icon: 'coins', title: 'Track All Expenses', description: 'Add and manage your UPI, card, cash and online payments easily.' },
  { icon: 'calendar', title: 'Manage Recurring Payments', description: 'Keep track of subscriptions, EMIs and bills so you never miss a due date.' },
  { icon: 'chart', title: 'Understand Your Spending', description: 'See clear insights and category-wise spending at a glance.' },
  { icon: 'bell', title: 'Stay in Control', description: 'Get upcoming payment reminders and avoid unnecessary charges.' },
];

const steps = [
  { icon: 'receipt', title: '1. Add Transactions', text: 'Record your daily expenses in seconds.' },
  { icon: 'calendar', title: '2. Manage Recurring', text: 'Add subscriptions, EMIs and bills.' },
  { icon: 'chart', title: '3. Get Insights', text: 'Understand your spending and plan better.' },
];

function LandingPage({ onGetStarted }) {
  return (
    <div className="overflow-hidden bg-white text-black">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <a href="#home" className="text-2xl font-bold tracking-tight sm:text-[28px]">PayWise</a>
          <div className="hidden items-center gap-8 text-sm md:flex">
            <a className="border-b-2 border-black pb-2 font-medium" href="#home">Home</a>
            <a className="pb-2 text-neutral-600 hover:text-black" href="#features">Features</a>
            <a className="pb-2 text-neutral-600 hover:text-black" href="#how-it-works">How It Works</a>
            <a className="pb-2 text-neutral-600 hover:text-black" href="#about">About</a>
          </div>
          <button onClick={onGetStarted} className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800">Get Started</button>
        </nav>
      </header>

      <main>
        <section id="home" className="mx-auto grid max-w-[1400px] items-center gap-7 px-5 pb-14 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-6 lg:px-12 lg:pb-20 lg:pt-12">
          <div className="relative z-10">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-neutral-600 sm:text-sm">Track&nbsp; Manage&nbsp; Stay Ahead</p>
            <h1 className="max-w-[600px] text-4xl font-bold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[clamp(3rem,4.25vw,4.6rem)]">Complete control of your money</h1>
            <p className="mt-5 max-w-[540px] text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">Track expenses, manage subscriptions, bills and EMIs, and get a clear view of where your money goes — all in one simple place.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={onGetStarted} className="inline-flex items-center gap-3 rounded-lg bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800 sm:px-8">Get Started <Icon name="arrow" className="h-5 w-5" /></button>
              <a href="#how-it-works" className="rounded-lg border border-neutral-400 px-5 py-3.5 text-sm font-semibold transition hover:bg-neutral-100 sm:px-8">See How It Works</a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs text-neutral-700 sm:gap-x-6 sm:text-sm">
              {['Track all expenses', 'Never miss a payment', 'Understand your spending'].map((item) => <span key={item} className="flex items-center gap-2"><Icon name="check" className="h-4 w-4" />{item}</span>)}
            </div>
          </div>
          <DashboardPreview />
        </section>

        <section id="features" className="mx-auto grid max-w-[1400px] gap-8 px-5 pb-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:gap-0 lg:px-12 lg:pb-16">
          {features.map((feature, index) => (
            <article key={feature.title} className={`px-0 lg:px-8 ${index > 0 ? 'lg:border-l lg:border-neutral-200' : 'lg:pl-0'} ${index === 3 ? 'lg:pr-0' : ''}`}>
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-neutral-50"><Icon name={feature.icon} className="h-8 w-8" /></div>
              <h2 className="text-lg font-bold tracking-tight">{feature.title}</h2>
              <p className="mt-2 max-w-[290px] text-sm leading-6 text-neutral-600 sm:text-base">{feature.description}</p>
            </article>
          ))}
        </section>

        <section id="how-it-works" className="mx-4 mb-12 rounded-2xl bg-neutral-50 px-5 py-8 sm:mx-8 sm:px-8 lg:mx-auto lg:mb-16 lg:max-w-[1400px] lg:px-12 lg:py-8">
          <div className="grid gap-7 lg:grid-cols-[0.95fr_1.65fr] lg:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-600 sm:text-sm">How It Works</p>
              <h2 className="mt-3 max-w-[420px] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Simple steps to a clearer financial life</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {steps.map((step) => (
                <article key={step.title} className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-white p-4 sm:flex-col sm:p-5 lg:flex-row">
                  <Icon name={step.icon} className="h-8 w-8 shrink-0" />
                  <div><h3 className="text-sm font-semibold">{step.title}</h3><p className="mt-1.5 text-xs leading-5 text-neutral-600 sm:text-sm">{step.text}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="about" className="border-t border-neutral-200 px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <a href="#home" className="w-fit text-lg font-bold tracking-tight text-black">PayWise</a>
          <p>Know where your money goes. Plan what comes next.</p>
          <p>© 2026 PayWise</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
