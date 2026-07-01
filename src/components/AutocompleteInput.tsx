import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface AutocompleteInputProps {
  value: string | number;
  onChange: (value: string) => void;
  tableName: string;
  fieldName: string;
  type?: 'text' | 'tel' | 'number';
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function AutocompleteInput({
  value,
  onChange,
  tableName,
  fieldName,
  type = 'text',
  placeholder,
  className,
  required
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(fieldName)
        .not(fieldName, 'is', null)
        .neq(fieldName, '');

      if (error) throw error;

      if (data) {
        const uniqueValues = [...new Set(data.map(item => String(item[fieldName])).filter(v => v))];
        setSuggestions(uniqueValues);
        setFilteredSuggestions(uniqueValues);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleFocus = () => {
    if (suggestions.length === 0) {
      fetchSuggestions();
    }
    setShowSuggestions(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue) {
      const filtered = suggestions.filter(s =>
        s.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(suggestions);
    }
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type={type}
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={className}
        required={required}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="px-4 py-2 hover:bg-teal-50 cursor-pointer transition-colors"
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
