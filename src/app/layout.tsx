import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutGrid, BarChart2, Settings, UserCircle,} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quarry Tracker",
  description: "SaaS for managing quarry applications",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutGrid },
    { href: "#", label: "Analytics", icon: BarChart2 },
    { href: "#", label: "Settings", icon: Settings },
  ];

  return (
    <html lang="en">
      <body className="antialiased">
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        
        <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr]">
          
          <aside className="hidden border-r bg-card md:block">
            <div className="flex h-full max-h-screen flex-col">
              <div className="flex h-16 items-center border-b px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                  <span className="text-primary">Quarry</span>
                  <span>Track</span>
                </Link>
              </div>
              <div className="flex-1 py-4">
                <nav className="grid items-start px-4 text-sm font-medium">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                        item.label === 'Dashboard' 
                          ? 'bg-accent text-primary font-semibold' 
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          <div className="flex flex-col">
            <header className="flex h-16 items-center justify-end gap-4 border-b bg-card px-6">
              <button className="rounded-full border w-9 h-9 flex items-center justify-center hover:bg-accent">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <span className="sr-only">Toggle user menu</span>
              </button>
            </header>

            <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}