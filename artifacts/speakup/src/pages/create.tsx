import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateClass } from "@workspace/api-client-react";
import { setSession } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const createSchema = z.object({
  teacherName: z.string().min(1, "Please enter your name"),
  name: z.string().min(1, "Please enter a class name"),
});

type CreateValues = z.infer<typeof createSchema>;

export default function CreateClass() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createClassMutation = useCreateClass();

  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      teacherName: "",
      name: "",
    },
  });

  const onSubmit = (values: CreateValues) => {
    createClassMutation.mutate({ data: values }, {
      onSuccess: (classroom) => {
        setSession({ role: "teacher", classId: classroom.id, classCode: classroom.code, className: classroom.name, teacherName: classroom.teacherName });
        toast({
          title: "Classroom created!",
          description: "Welcome to your new virtual bulletin board.",
        });
        setLocation(`/classroom/${classroom.id}`);
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Oh no!",
          description: "Something went wrong creating your classroom.",
        });
      }
    });
  };

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center max-w-md mx-auto w-full">
        <Card className="w-full p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-serif">Create a Class</h1>
            <p className="text-muted-foreground">Set up your classroom board in seconds.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="teacherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Mr. Smith" {...field} className="h-12 text-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Intro to Biology" {...field} className="h-12 text-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-medium"
                disabled={createClassMutation.isPending}
              >
                {createClassMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Create Classroom
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </Layout>
  );
}
