"use client";

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export default function NavButton({ active, onClick, children }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm"
          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
      }`}
    >
      {children}
    </button>
  );
}
