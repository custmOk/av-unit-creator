import React, { useState, useRef, useEffect } from 'react';

interface Props {
    value: string;
    onChange: (val: string) => void;
    categories: string[];
}

export const CategorySelect: React.FC<Props> = ({ value, onChange, categories }) => {
    const [isOpen, setIsOpen] = useState(false);
    // Filter options based on what the user types
    const filteredOptions = categories.filter((cat) =>
        cat.toLowerCase().includes(value.toLowerCase())
    );

    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (cat: string) => {
        onChange(cat);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <div className="relative">
                <input
                    type="text"
                    className="w-full bg-gray-900 text-white p-2 pr-10 rounded border border-gray-600 focus:border-blue-500 outline-none placeholder-gray-500"
                    placeholder="Select or Create Category..."
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                
                {/* Chevron Icon (Clicking toggles dropdown) */}
                <div 
                    className="absolute inset-y-0 right-0 flex items-center px-2 cursor-pointer text-gray-400 hover:text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((cat) => (
                            <div
                                key={cat}
                                onClick={() => handleSelect(cat)}
                                className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm text-gray-200 transition-colors"
                            >
                                {cat}
                            </div>
                        ))
                    ) : (
                        // Logic: If typed text doesn't exist in list, show "Create" prompt
                        value.trim() !== '' && (
                            <div 
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-blue-900/30 text-blue-300 text-sm italic cursor-pointer"
                            >
                                Create new: "{value}"
                            </div>
                        )
                    )}
                    
                    {/* Fallback if list is empty and no text typed */}
                    {filteredOptions.length === 0 && value.trim() === '' && (
                        <div className="px-4 py-2 text-gray-500 text-xs italic">
                            Type to create a category...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};