import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
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
import { Check, CheckCircle2, MessageCircleQuestion, Send, PowerOff, Loader2, Copy, CheckCheck } from "lucide-react";
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
    <Layout>
      <div className="w-full max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold text-foreground">
              {session?.className || "Classroom"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isTeacher ? `Teacher: ${session?.teacherName}` : `Hosted by ${session?.teacherName || "your teacher"}`}
            </p>
          </div>

          {isTeacher && session?.classCode && (
            <Card className="p-5 bg-primary/5 border-primary/20 flex flex-col items-center gap-3">
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">Share this code</div>
              <div className="text-5xl font-mono font-bold tracking-[0.25em] text-foreground select-all">
                {session.classCode}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="gap-2 text-xs"
              >
                {codeCopied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {codeCopied ? "Copied!" : "Copy code"}
              </Button>
              {summary && (
                <div className="flex gap-4 text-sm border-t pt-3 w-full justify-center">
                  <span className="text-muted-foreground">Total: <strong className="text-foreground">{summary.totalQuestions}</strong></span>
                  <span className="text-green-600">Answered: <strong>{summary.answeredQuestions}</strong></span>
                  <span className="text-amber-600">Waiting: <strong>{summary.unansweredQuestions}</strong></span>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Student Input Section */}
        {!isTeacher && (
          <Card className="p-6 border-accent/20 bg-accent/5">
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
                          className="min-h-[100px] text-lg resize-none bg-background"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" size="lg" className="gap-2" disabled={submitQuestion.isPending}>
                    {submitQuestion.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Ask Question
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-2xl font-serif flex items-center gap-2">
              <MessageCircleQuestion className="w-6 h-6 text-primary" />
              Live Questions
            </h2>
            <Badge variant="secondary" className="text-sm font-normal">
              {activeQuestions.length} waiting
            </Badge>
          </div>

          {loadingQuestions ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : activeQuestions.length === 0 ? (
            <Card className="p-12 text-center border-dashed bg-transparent">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <MessageCircleQuestion className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">No questions yet</h3>
              <p className="text-muted-foreground">
                {isTeacher ? "Wait for students to ask something." : "Be the first to ask a question!"}
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeQuestions.map(q => (
                <Card key={q.id} className="p-5 flex flex-col sm:flex-row gap-4 justify-between group hover:border-primary/30 transition-colors">
                  <div className="space-y-2 flex-1">
                    <p className="text-lg text-foreground font-medium leading-snug">{q.text}</p>
                    <p className="text-sm text-muted-foreground">
                      Asked {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {isTeacher && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleMarkAnswered(q.id)}
                      className="shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark Answered
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Answered Questions */}
          {answeredQuestions.length > 0 && (
            <div className="mt-12 space-y-4">
              <h3 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Answered Questions
              </h3>
              <div className="grid gap-3 opacity-60">
                {answeredQuestions.map(q => (
                  <Card key={q.id} className="p-4 bg-muted/50 border-transparent">
                    <p className="text-foreground line-through decoration-muted-foreground/30">{q.text}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
