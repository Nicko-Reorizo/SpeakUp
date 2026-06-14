import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClassByCode } from "@workspace/api-client-react";
import { setSession } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function JoinClass() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Class codes are exactly 6 characters long.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const classroom = await getClassByCode(code.toUpperCase());
      setSession({ role: "student", classId: classroom.id });
      toast({
        title: "Joined successfully!",
        description: `Welcome to ${classroom.name}.`,
      });
      setLocation(`/classroom/${classroom.id}`);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Class not found",
        description: "Double check your code and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center max-w-md mx-auto w-full">
        <Card className="w-full p-8 space-y-6 border-accent/20">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-serif">Join a Class</h1>
            <p className="text-muted-foreground">Enter your teacher's 6-letter class code.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Class Code</Label>
              <Input 
                id="code" 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABCDEF" 
                maxLength={6}
                className="h-14 text-center text-2xl tracking-[0.2em] font-mono font-bold uppercase"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-medium bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Join Classroom
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
