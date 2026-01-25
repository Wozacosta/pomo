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
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
      }`}
    >
      {children}
    </button>
  );
}
