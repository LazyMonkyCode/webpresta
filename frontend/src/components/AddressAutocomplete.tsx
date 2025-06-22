import React, { useState, useEffect, useRef } from 'react';
import addressValidationService from '../services/addressValidation';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onValidationChange,
  placeholder = "Tu dirección completa",
  error,
  required = false
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; error?: string }>({ isValid: false });
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce para evitar demasiadas llamadas a la API
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (value.length >= 3) {
        setIsValidating(true);
        try {
          const suggestions = await addressValidationService.getAddressSuggestions(value);
          setSuggestions(suggestions);
          setShowSuggestions(suggestions.length > 0);
        } catch (error) {
          console.error('Error obteniendo sugerencias:', error);
        } finally {
          setIsValidating(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  // Validar dirección cuando cambia el valor
  useEffect(() => {
    const validateAddress = async () => {
      if (value.length >= 10) {
        setIsValidating(true);
        try {
          const result = await addressValidationService.validate(value);
          setValidationResult(result);
          onValidationChange?.(result.isValid);
        } catch (error) {
          console.error('Error validando dirección:', error);
          setValidationResult({ isValid: false, error: 'Error al validar dirección' });
          onValidationChange?.(false);
        } finally {
          setIsValidating(false);
        }
      } else {
        setValidationResult({ isValid: false });
        onValidationChange?.(false);
      }
    };

    validateAddress();
  }, [value, onValidationChange]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            error ? 'border-red-300' : validationResult.isValid ? 'border-green-300' : 'border-gray-300'
          }`}
        />
        {required && <span className="text-red-500 ml-1">*</span>}
        
        {/* Indicador de validación */}
        {isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          </div>
        )}
        
        {!isValidating && validationResult.isValid && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {(error || validationResult.error) && (
        <p className="mt-1 text-sm text-red-600">{error || validationResult.error}</p>
      )}

      {/* Sugerencias */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Información de ayuda */}
      {value.length > 0 && value.length < 10 && (
        <p className="mt-1 text-xs text-gray-500">
          Continúa escribiendo para obtener sugerencias...
        </p>
      )}
    </div>
  );
};

export default AddressAutocomplete; 