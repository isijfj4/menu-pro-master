'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { RestaurantType } from '@/lib/types';

// Type options for the filter
const typeOptions: { value: RestaurantType; label: string }[] = [
  { value: 'pollería', label: 'Pollería' },
  { value: 'café', label: 'Café' },
  { value: 'chifa', label: 'Chifa' },
  { value: 'cevichería', label: 'Cevichería' },
  { value: 'Nikkei', label: 'Nikkei' },
  { value: 'Criollo', label: 'Criollo' },
  { value: 'pizzería', label: 'Pizzería' },
  { value: 'otro', label: 'Otro' }
];

interface FiltersBarProps {
  onTypeChange: (type: RestaurantType | null) => void;
  onSearchChange: (search: string) => void;
  selectedType: RestaurantType | null;
}

export default function FiltersBar({ 
  onTypeChange, 
  onSearchChange, 
  selectedType 
}: FiltersBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange(searchTerm);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, onSearchChange]);

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar restaurantes..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Type filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onTypeChange(null)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedType === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Todos
          </button>
          
          {typeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onTypeChange(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedType === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
