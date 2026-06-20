import { useEffect, useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getSession, clearSession } from "@/lib/session";
import {
  useGetClassSummary,
  getGetClassSummaryQueryKey,
  useListQuestions,
  getListQuestionsQueryKey,
  useSubmitQuestion,
  useUpdateQuestion,
  useCloseClass
} from "@workspace/api-client-react";
import {
  Check,
  CheckCircle2,
  MessageCircleQuestion,
  Send,
  PowerOff,
  Loader2,
  Copy,
  CheckCheck,
  Users,
  MessageSquareHeart,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const questionSchema = z.object({
  text: z.string().min(1, "Question cannot be empty").max(500, "Question is too long"),
});

type QuestionValues = z.infer<typeof questionSchema>;

export default function Classroom() {
  const [, params] = useRoute("/classroom/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [codeCopied, setCodeCopied] = useState(false);

  const classId = params?.id ? parseInt(params.id, 10) : 0;
  const session = getSession();

  const handleCopyCode = () => {
    if (session?.classCode) {
      navigator.clipboard.writeText(session.classCode).then(() => {
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      });
    }
  };

  const handleCloseClass = () => {
    closeClass.mutate({ classId }, {
      onSuccess: () => {
        clearSession();
        toast({ title: "Session ended", description: "Your classroom has been closed." });
        setLocation("/");
      }
    });
  };

  useEffect(() => {
    if (!session || session.classId !== classId) {
      setLocation("/");
    }
  }, [session, classId, setLocation]);

  const { data: summary, isLoading: loadingSummary } = useGetClassSummary(classId, {
    query: {
      enabled: !!classId,
      queryKey: getGetClassSummaryQueryKey(classId),
      refetchInterval: 3000,
    }
  });

  const { data: questions, isLoading: loadingQuestions } = useListQuestions(classId, {
    query: {
      enabled: !!classId,
      queryKey: getListQuestionsQueryKey(classId),
      refetchInterval: 3000,
    }
  });

  const submitQuestion = useSubmitQuestion();
  const updateQuestion = useUpdateQuestion();
  const closeClass = useCloseClass();

  const form = useForm<QuestionValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: { text: "" },
  });

  if (!session || session.classId !== classId) {
    return null;
  }

  const isTeacher = session.role === "teacher";
  const activeQuestions = questions?.filter(q => !q.isAnswered).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];
  const answeredQuestions = questions?.filter(q => q.isAnswered).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

  const onSubmitQuestion = (values: QuestionValues) => {
    submitQuestion.mutate({ classId, data: values }, {
      onSuccess: () => {
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListQuestionsQueryKey(classId) });
        toast({ title: "Question sent!", description: "Your question was submitted anonymously." });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Could not send question." });
      }
    });
  };

  const handleMarkAnswered = (questionId: number) => {
    updateQuestion.mutate({ classId, questionId, data: { isAnswered: true } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListQuestionsQueryKey(classId) });
        queryClient.invalidateQueries({ queryKey: getGetClassSummaryQueryKey(classId) });
      }
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sticky top nav */}
      <header className="bg-white border-b border-neutral-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2.5 text-primary hover:opacity-80 transition-opacity">
          <MessageSquareHeart className="w-6 h-6" />
          <span className="font-serif text-xl font-semibold tracking-tight">SpeakUp</span>
        </Link>

        {isTeacher ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseClass}
            disabled={closeClass.isPending}
            className="gap-2 text-neutral-400 hover:text-red-500 hover:bg-red-50"
          >
            {closeClass.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PowerOff className="w-4 h-4" />}
            End session
          </Button>
        ) : (
          <div className="text-sm text-muted-foreground">
            Hosted by <span className="font-medium text-foreground">{session.teacherName}</span>
          </div>
        )}
      </header>

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-8">

        {/* Page title + stats */}
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              {session?.className || "Classroom"}
            </h1>
            <p className="text-sm text-neutral-400 mt-0.5">
              {isTeacher ? `Hosted by ${session?.teacherName}` : `Joined as a student`}
            </p>
          </div>

          {/* Stat pills */}
          {!loadingSummary && summary && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white border border-neutral-100 rounded-xl px-4 py-2.5 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm font-semibold text-neutral-700">{summary.unansweredQuestions}</span>
                <span className="text-sm text-neutral-400">waiting</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-neutral-100 rounded-xl px-4 py-2.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-neutral-700">{summary.answeredQuestions}</span>
                <span className="text-sm text-neutral-400">answered</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-neutral-100 rounded-xl px-4 py-2.5 shadow-sm">
                <Users className="w-4 h-4 text-neutral-400" />
                <span className="text-sm font-semibold text-neutral-700">{summary.totalQuestions}</span>
                <span className="text-sm text-neutral-400">total</span>
              </div>
            </div>
          )}
          {loadingSummary && (
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          )}
        </div>

        {/* Teacher: two-column layout */}
        {isTeacher ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Share code sidebar */}
            {session?.classCode && (
              <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm flex flex-col items-center gap-4 md:sticky md:top-24">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Copy className="w-5 h-5 text-primary" />
                </div>
                <div className="text-center w-full">
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">Classroom code</p>
                  <div className="text-4xl font-mono font-bold tracking-[0.2em] text-neutral-900 select-all bg-neutral-50 rounded-xl px-4 py-3">
                    {session.classCode}
                  </div>
                </div>
                <Button
                  onClick={handleCopyCode}
                  className={`w-full gap-2 transition-all ${codeCopied ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                >
                  {codeCopied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {codeCopied ? "Copied!" : "Copy code"}
                </Button>
                <p className="text-xs text-neutral-400 text-center leading-relaxed">
                  Share this code with students so they can join anonymously.
                </p>
              </div>
            )}

            {/* Questions feed */}
            <div className="md:col-span-2 space-y-4">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Live Questions</p>

              {loadingQuestions ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
              ) : activeQuestions.length === 0 ? (
                <div className="bg-white border border-neutral-100 rounded-2xl p-12 text-center shadow-sm">
                  <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageCircleQuestion className="w-7 h-7 text-neutral-300" />
                  </div>
                  <h3 className="font-semibold text-neutral-700 mb-1">No questions yet</h3>
                  <p className="text-sm text-neutral-400">Students will appear here once they ask something.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeQuestions.map((q, i) => (
                    <div
                      key={q.id}
                      className="group bg-white border border-neutral-100 rounded-2xl p-5 flex gap-4 items-start shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/5 border border-primary/15 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-primary">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-neutral-800 font-medium leading-snug">{q.text}</p>
                        <p className="text-xs text-neutral-400 mt-1.5">
                          {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAnswered(q.id)}
                        className="shrink-0 gap-1.5 group-hover:border-emerald-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Done
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {answeredQuestions.length > 0 && (
                <div className="pt-4 space-y-3">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Answered
                  </p>
                  {answeredQuestions.map(q => (
                    <div key={q.id} className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 flex gap-3 items-start opacity-50">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-600 line-through decoration-neutral-300">{q.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Student layout: single column */
          <div className="max-w-2xl space-y-8">
            {/* Ask a question */}
            <Card className="p-6 border-neutral-100 shadow-sm rounded-2xl">
              <p className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-4">Ask a question</p>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitQuestion)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="What's on your mind? (Completely anonymous)"
                            className="min-h-[100px] text-base resize-none bg-neutral-50 border-neutral-200 rounded-xl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" size="lg" className="gap-2 rounded-xl" disabled={submitQuestion.isPending}>
                      {submitQuestion.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      Ask Question
                    </Button>
                  </div>
                </form>
              </Form>
            </Card>

            {/* Live questions */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Live Questions</p>

              {loadingQuestions ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                </div>
              ) : activeQuestions.length === 0 ? (
                <div className="bg-white border border-neutral-100 rounded-2xl p-10 text-center shadow-sm">
                  <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <MessageCircleQuestion className="w-6 h-6 text-neutral-300" />
                  </div>
                  <h3 className="font-semibold text-neutral-700 mb-1">No questions yet</h3>
                  <p className="text-sm text-neutral-400">Be the first to ask one!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeQuestions.map((q, i) => (
                    <div key={q.id} className="bg-white border border-neutral-100 rounded-2xl p-5 flex gap-4 shadow-sm">
                      <div className="w-6 h-6 rounded-full bg-primary/5 border border-primary/15 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-primary">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-neutral-800 font-medium leading-snug">{q.text}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {answeredQuestions.length > 0 && (
                <div className="pt-4 space-y-3">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Answered
                  </p>
                  {answeredQuestions.map(q => (
                    <div key={q.id} className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 flex gap-3 items-start opacity-50">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-600 line-through decoration-neutral-300">{q.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
