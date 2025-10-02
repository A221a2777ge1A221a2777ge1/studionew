import { Header } from "@/components/header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
            {children}
        </main>
    </div>
  );
}
