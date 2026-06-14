import { Link } from "wouter";
import { MessageSquareHeart } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center">
      <header className="w-full max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <MessageSquareHeart className="w-8 h-8" />
          <span className="font-serif text-2xl font-semibold tracking-tight">SpeakUp</span>
        </Link>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 pb-12 flex flex-col">
        {children}
      </main>
    </div>
  );
}
