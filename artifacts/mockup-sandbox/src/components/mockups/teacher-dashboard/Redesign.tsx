import { useState } from "react";
import { Check, CheckCircle2, MessageCircleQuestion, Copy, CheckCheck, PowerOff, Users } from "lucide-react";

const mockQuestions = [
  { id: 1, text: "Can you explain the difference between props and state in React?", createdAt: new Date(Date.now() - 120000).toISOString(), isAnswered: false },
  { id: 2, text: "How does the virtual DOM work under the hood?", createdAt: new Date(Date.now() - 240000).toISOString(), isAnswered: false },
  { id: 3, text: "What is closure and why is it useful?", createdAt: new Date(Date.now() - 480000).toISOString(), isAnswered: true },
];

function formatAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function Redesign() {
  const [codeCopied, setCodeCopied] = useState(false);
  const [questions, setQuestions] = useState(mockQuestions);

  const active = questions.filter(q => !q.isAnswered);
  const answered = questions.filter(q => q.isAnswered);

  const handleMarkAnswered = (id: number) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, isAnswered: true } : q));
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">

      {/* Top nav bar */}
      <header className="bg-white border-b border-neutral-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <MessageCircleQuestion className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <span className="font-semibold text-neutral-900 text-lg tracking-tight">SpeakUp</span>
        </div>
        <button className="flex items-center gap-2 text-sm text-neutral-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50">
          <PowerOff className="w-4 h-4" />
          End session
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-8">

        {/* Page title + stats row */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Raphael</h1>
            <p className="text-sm text-neutral-400 mt-0.5">Hosted by Raphael Andrei Seguenza</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-neutral-100 rounded-xl px-4 py-3 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-sm font-semibold text-neutral-700">{active.length}</span>
              <span className="text-sm text-neutral-400">waiting</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-neutral-100 rounded-xl px-4 py-3 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-neutral-700">{answered.length}</span>
              <span className="text-sm text-neutral-400">answered</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-neutral-100 rounded-xl px-4 py-3 shadow-sm">
              <Users className="w-4 h-4 text-neutral-400" />
              <span className="text-sm font-semibold text-neutral-700">{questions.length}</span>
              <span className="text-sm text-neutral-400">total</span>
            </div>
          </div>
        </div>

        {/* Main 2-col layout */}
        <div className="grid grid-cols-3 gap-6 items-start">

          {/* Share code card — left sidebar */}
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm flex flex-col items-center gap-4 col-span-1 sticky top-24">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Copy className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">Classroom code</p>
              <div className="text-4xl font-mono font-bold tracking-[0.2em] text-neutral-900 select-all bg-neutral-50 rounded-xl px-4 py-3">
                USDEL2
              </div>
            </div>
            <button
              onClick={() => { setCodeCopied(true); setTimeout(() => setCodeCopied(false), 2000); }}
              className={`w-full flex items-center justify-center gap-2 text-sm font-medium rounded-xl px-4 py-2.5 transition-all ${
                codeCopied
                  ? "bg-emerald-500 text-white"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              {codeCopied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {codeCopied ? "Copied!" : "Copy code"}
            </button>
            <p className="text-xs text-neutral-400 text-center leading-relaxed">
              Share this code with students to let them join anonymously.
            </p>
          </div>

          {/* Questions feed — right main area */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-widest">Live Questions</h2>
            </div>

            {active.length === 0 ? (
              <div className="bg-white border border-neutral-100 rounded-2xl p-12 text-center shadow-sm">
                <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircleQuestion className="w-7 h-7 text-neutral-300" />
                </div>
                <h3 className="font-semibold text-neutral-700 mb-1">No questions yet</h3>
                <p className="text-sm text-neutral-400">Students will appear here once they ask something.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {active.map((q, i) => (
                  <div
                    key={q.id}
                    className="group bg-white border border-neutral-100 rounded-2xl p-5 flex gap-4 items-start shadow-sm hover:border-orange-200 hover:shadow-md transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-orange-500">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-neutral-800 font-medium leading-snug">{q.text}</p>
                      <p className="text-xs text-neutral-400 mt-1.5">{formatAgo(q.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => handleMarkAnswered(q.id)}
                      className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-neutral-400 border border-neutral-200 rounded-xl px-3 py-1.5 group-hover:border-emerald-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Done
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Answered section */}
            {answered.length > 0 && (
              <div className="pt-4 space-y-3">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Answered
                </p>
                {answered.map(q => (
                  <div key={q.id} className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 flex gap-3 items-start opacity-50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-neutral-600 line-through decoration-neutral-300">{q.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
