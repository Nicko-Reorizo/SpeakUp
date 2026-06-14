import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { GraduationCap, Users, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-serif text-foreground">
            A safe space to ask <br />
            <span className="text-primary">every question.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            Create a welcoming virtual bulletin board for your classroom where students can speak up without fear of judgment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 w-full mt-8">
          <Link href="/create" className="group block focus:outline-none">
            <Card className="p-8 h-full flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-serif mb-2">I'm a Teacher</h2>
                <p className="text-muted-foreground text-sm">Create a new classroom board and invite your students.</p>
              </div>
              <div className="flex items-center gap-2 text-primary font-medium mt-4">
                Create a Class <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          <Link href="/join" className="group block focus:outline-none">
            <Card className="p-8 h-full flex flex-col items-center justify-center text-center space-y-4 hover:border-accent/50 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-serif mb-2">I'm a Student</h2>
                <p className="text-muted-foreground text-sm">Join an existing classroom to ask questions anonymously.</p>
              </div>
              <div className="flex items-center gap-2 text-accent font-medium mt-4">
                Join a Class <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
