'use client';
import { Zap } from 'lucide-react';

interface HeaderProps {
  onAddBrand: () => void;
}

export default function Header({ onAddBrand }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-950/90 backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <Zap size={14} className="text-white" />
        </div>
        <span className="font-semibold text-white text-sm tracking-tight">Meta Ad Spy</span>
        <span className="ml-1 text-xs text-gray-500 hidden sm:inline">DTC Intelligence</span>
      </div>

      <button
        onClick={onAddBrand}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
      >
        <span className="text-base leading-none">+</span>
        Add Brand
      </button>
    </header>
  );
}
