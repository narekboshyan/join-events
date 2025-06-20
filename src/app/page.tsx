"use client";
import { useTheme } from "next-themes";

export default function Home() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
          <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
            Get started by editing&nbsp;
          </p>

          <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white/0 dark:from-black dark:via-black/0 lg:static lg:h-auto lg:w-auto lg:bg-none">
            <div className="flex flex-col space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Current theme: {theme}
                </p>
              </div>

              <button
                onClick={() => setTheme("light")}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Light Mode
              </button>

              <button
                onClick={() => setTheme("dark")}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Dark Mode
              </button>

              <button
                onClick={() => setTheme("system")}
                className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors cursor-pointer"
              >
                System
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
