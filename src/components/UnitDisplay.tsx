import React, { useState } from 'react';
import type { Unit } from '../types';
import { ActiveAbilitySlot } from './ActiveAbilitySlot';

interface Props {
    unit: Unit;
}

export const UnitDisplay: React.FC<Props> = ({ unit }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex items-start">
            {/* MAIN CARD */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
          relative w-72 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden 
          cursor-pointer transition-all duration-300 z-10
          ${isOpen ? 'ring-2 ring-blue-500 shadow-2xl scale-105' : 'hover:scale-105 hover:shadow-xl'}
        `}
            >
                {/* Unit Image */}
                <div className="h-56 relative group">
                    <img
                        src={unit.imageUrl}
                        alt={unit.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    <div className="absolute bottom-0 w-full bg-linear-to-t from-gray-900 p-4">
                        <h2 className="text-2xl font-bold text-white">
                            {unit.name}
                        </h2>
                        <div className="flex gap-2 text-xs mt-1"></div>
                    </div>
                </div>

                {/* Passive Abilities List */}
                <div className="p-4 bg-gray-800/50 min-h-30">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                        Passives
                    </h3>
                    <ul className="space-y-3">
                        {unit.passives.map((p, i) => (
                            <li key={i} className="text-sm">
                                <span className="text-yellow-500 font-semibold mr-2">
                                    ✦ {p.name}:
                                </span>
                                <span className="text-gray-400 text-xs leading-relaxed">
                                    {p.description}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* ACTIVE ABILITIES (Sidebar) */}
            <div className="flex flex-col gap-3 pt-8">
                {unit.actives.map((ability, index) => (
                    <ActiveAbilitySlot
                        key={index}
                        ability={ability}
                        isVisible={isOpen}
                        delay={index * 100} // Stagger effect: 1st waits 0ms, 2nd waits 100ms...
                    />
                ))}
            </div>
        </div>
    );
};
