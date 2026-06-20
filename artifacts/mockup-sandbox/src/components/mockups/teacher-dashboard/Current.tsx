import { useState } from "react";
import { Check, CheckCircle2, MessageCircleQuestion, Copy, CheckCheck } from "lucide-react";

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

export function Current() {
  const [codeCopied, setCodeCopied] = useState(false);
  const [questions, setQuestions] = useState(mockQuestions);

  const active = questions.filter(q => !q.isAnswered);
  const answered = questions.filter(q => q.isAnswered);

  const handleMarkAnswered = (id: number) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, isAnswered: true } : q));
  };

  return (
    <div className="min-h-screen bg-[#f5f4f0] p-8">
      <div className="w-full max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold text-foreground">Raphael</h1>
            <p className="text-muted-foreground text-lg">Teacher: Raphael Andrei Seguenza</p>
          </div>

          <div className="p-5 bg-orange-50 border border-orange-100 rounded-lg flex flex-col items-center gap-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-orange-500">Share this code</div>
            <div className="text-5xl font-mono font-bold tracking-[0.25em] text-foreground select-all">USDEL2</div>
            <button
              onClick={() => { setCodeCopied(true); setTimeout(() => setCodeCopied(false), 2000); }}
              className="flex items-center gap-2 text-xs border border-gray-200 rounded px-3 py-1.5 bg-white hover:bg-gray-50"
            >
              {codeCopied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {codeCopied ? "Copied!" : "Copy code"}
            </button>
            <div className="flex gap-4 text-sm border-t pt-3 w-full justify-center">
              <span className="text-muted-foreground">Total: <strong className="text-foreground">{questions.length}</strong></span>
              <span className="text-green-600">Answered: <strong>{answered.length}</strong></span>
              <span className="text-amber-600">Waiting: <strong>{active.length}</strong></span>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-2xl font-serif flex items-center gap-2">
              <MessageCircleQuestion className="w-6 h-6 text-orange-500" />
              Live Questions
            </h2>
            <span className="text-sm bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{active.length} waiting</span>
          </div>

          {active.length === 0 ? (
            <div className="p-12 text-center border-dashed border-2 border-gray-200 rounded-lg">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <MessageCircleQuestion className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">No questions yet</h3>
              <p className="text-muted-foreground">Wait for students to ask something.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {active.map(q => (
                <div key={q.id} className="p-5 bg-white border border-gray-200 rounded-lg flex flex-col sm:flex-row gap-4 justify-between group hover:border-orange-200 transition-colors">
                  <div className="space-y-2 flex-1">
                    <p className="text-lg text-foreground font-medium leading-snug">{q.text}</p>
                    <p className="text-sm text-muted-foreground">Asked {formatAgo(q.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleMarkAnswered(q.id)}
                    className="shrink-0 flex items-center gap-2 border border-gray-200 rounded px-4 py-2 text-sm hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Mark Answered
                  </button>
                </div>
              ))}
            </div>
          )}

          {answered.length > 0 && (
            <div className="mt-12 space-y-4">
              <h3 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Answered Questions
              </h3>
              <div className="grid gap-3 opacity-60">
                {answered.map(q => (
                  <div key={q.id} className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-foreground line-through decoration-gray-400">{q.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
