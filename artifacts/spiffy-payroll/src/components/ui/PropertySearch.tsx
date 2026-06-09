import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { PROPERTIES } from "@/data/properties";
import { Input } from "@/components/ui/input";

export interface PropertySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PropertySearch({ value, onChange, placeholder = "Which property?" }: PropertySearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = PROPERTIES.filter(p => p.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (prop: string) => {
    onChange(prop);
    setSearch("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <Input
        data-testid="property-search"
        type="text"
        placeholder={placeholder}
        value={isOpen ? search : value}
        onChange={(e) => {
          setSearch(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full min-h-[48px] text-lg bg-white"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
      />
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">No properties found</div>
          ) : (
            filtered.map((prop, idx) => (
              <div
                key={idx}
                className="p-3 hover:bg-blue-50 cursor-pointer text-[#1A1A2A] border-b border-gray-100 last:border-0"
                onClick={() => handleSelect(prop)}
              >
                {prop}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
