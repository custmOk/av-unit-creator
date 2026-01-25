import React, { useState } from 'react';
import type { ActiveAbility } from '../types';

interface Props {
    ability: ActiveAbility;
    isVisible: boolean;
    delay: number; // Stagger animation
}

export const ActiveAbilitySlot: React.FC<Props> = ({
    ability,
    isVisible,
    delay,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`
        relative w-16 h-16 ml-4 bg-gray-800 border-2 border-blue-500/50 rounded-lg 
        cursor-pointer hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]
        transition-all duration-500 ease-out transform
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}
      `}
            style={{ transitionDelay: `${delay}ms` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Ability Icon */}
            <img
                src={ability.iconUrl}
                alt={ability.name}
                className="w-full h-full object-cover rounded-md"
            />

            {/* Hover Tooltip (Description + Cooldown) */}
            {isHovered && (
                <div className="absolute left-full top-0 ml-3 w-48 bg-gray-900 border border-gray-600 rounded-md p-3 z-50 shadow-xl">
                    <h4 className="font-bold text-white text-sm mb-1">
                        {ability.name}
                    </h4>
                    <p className="text-xs text-gray-300 mb-2">
                        {ability.description}
                    </p>
                    <div className="flex items-center text-xs font-mono text-blue-400">
                        <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        {ability.cooldown}s Cooldown
                    </div>
                    {/* Tooltip Arrow */}
                    <div className="absolute top-4 -left-1 w-2 h-2 bg-gray-900 border-l border-b border-gray-600 transform rotate-45"></div>
                </div>
            )}
        </div>
    );
};
