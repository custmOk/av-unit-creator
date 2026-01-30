import React from 'react';
import type { Unit, ActiveAbility, PassiveAbility, Rarity } from '../types';
import { RichTextParser } from './RichTextParser';

interface RarityStyle {
    borderCss: string;
    glowCss: string;
}

const RARITY_STYLES: Record<Rarity, RarityStyle> = {
    Rare: {
        borderCss: 'linear-gradient(150deg, #08f3ff 10%, #2747d3, #03c6ff)',
        glowCss: 'linear-gradient(150deg, #2747d3 -10%, #08f3ff 35%)',
    },
    Epic: {
        borderCss: 'linear-gradient(150deg, #b20eff 10%, #3e00d4, #ae04ff 80%)',
        glowCss: 'linear-gradient(150deg, #3e00d4 -10%, #b20eff 35%)',
    },
    Legendary: {
        borderCss:
            'linear-gradient(150deg, #f1ff00 10%, #ff6f00 45%, #ffff00 80%)',
        glowCss: 'linear-gradient(150deg, #ff6f00 -10%, #f1ff00 35%)',
    },
    Mythic: {
        borderCss:
            'linear-gradient(-125deg, #33ffcc 15%, #45ff41, #d6ff33, #fdd233, #ff7c33, #ff3346, #ff33b7 85%)',
        glowCss:
            'linear-gradient(-125deg, #33ffcc 15%, #45ff41, #d6ff33, #fdd233, #ff7c33, #ff3346, #ff33b7 85%)',
    },
    Exclusive: {
        borderCss: 'linear-gradient(150deg, #ec0004 10%, #e385ef 90%)',
        glowCss: 'linear-gradient(150deg, #ec0004 -10%, #e385ef 35%)',
    },
    Secret: {
        borderCss:
            'linear-gradient(150deg, #c60000 10%, #500000 45%, #f40000 80%)',
        glowCss: 'linear-gradient(150deg, #500000 -10%, #c60000 35%)',
    },
    Vanguard: {
        borderCss:
            'linear-gradient(150deg, #8369c5 10%, #999999 30%, #ffffff 50%, #999999 70%, #8369c5 90%)',
        glowCss:
            'linear-gradient(150deg, #8369c5 10%, #999999 30%, #ffffff 40%, #999999 70%, #8369c5 90%)',
    },
};

const PassiveGroupSlot = ({
    passives,
    isVisible,
}: {
    passives: PassiveAbility[];
    isVisible: boolean;
}) => {
    return (
        <div
            className={`
        group/icon relative w-16 h-16 ml-4 mb-3 bg-gray-900 border-2 border-yellow-500/50 rounded-lg 
        cursor-help hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(234,179,8,0.4)]
        transition-all duration-500 ease-out transform
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}
      `}
            style={{ transitionDelay: '0ms' }} // Always comes out first
        >
            {/* Icon for Passives (Using a generic 'Book/Scroll' icon) */}
            <div className="w-full h-full flex items-center justify-center bg-yellow-900/20">
                <span className="text-2xl">📖</span>
            </div>

            {/* --- THE POP-OUT LIST --- */}
            <div className="absolute left-full top-0 ml-3 w-72 bg-gray-900 border border-yellow-600/30 rounded-md p-4 opacity-0 group-hover/icon:opacity-100 transition-opacity z-50 pointer-events-none shadow-xl">
                <h4 className="font-bold text-yellow-500 text-sm uppercase tracking-wider mb-3 border-b border-gray-700 pb-2">
                    Passive Traits
                </h4>

                <ul className="space-y-4 max-h-75 overflow-y-auto custom-scrollbar">
                    {passives.map((p, i) => (
                        <li key={i} className="flex flex-col gap-1">
                            <span className="font-bold text-white text-sm">
                                <RichTextParser text={p.name} />
                            </span>
                            <div className="pl-2 space-y-1">
                                {p.description.map((line, lineIndex) => (
                                    <div
                                        key={lineIndex}
                                        className="flex items-start text-xs text-gray-300"
                                    >
                                        <span className="mr-2 text-yellow-600 mt-0.5">
                                            •
                                        </span>
                                        <span>
                                            <RichTextParser text={line} />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </li>
                    ))}
                    {passives.length === 0 && (
                        <li className="text-gray-500 text-xs italic">
                            No passive traits.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

const ActiveSlot = ({
    ability,
    index,
    isVisible,
}: {
    ability: ActiveAbility;
    index: number;
    isVisible: boolean;
}) => {
    const lines = Array.isArray(ability.description)
        ? ability.description
        : [ability.description];

    return (
        <div
            className={`
        group/icon relative w-16 h-16 ml-4 mb-3 bg-gray-800 border-2 border-blue-500/30 rounded-lg 
        cursor-help hover:border-blue-400 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]
        transition-all duration-500 ease-out transform
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}
      `}
            // We add 100ms delay because the Passive slot takes the 0ms spot
            style={{ transitionDelay: `${(index + 1) * 100}ms` }}
        >
            <img
                src={ability.iconUrl}
                alt={ability.name}
                className="w-full h-full object-cover rounded-md"
            />

            <div className="absolute left-full top-0 ml-3 w-56 bg-gray-900 border border-gray-600 rounded-md p-3 opacity-0 group-hover/icon:opacity-100 transition-opacity z-50 pointer-events-none shadow-xl">
                <h4 className="font-bold text-blue-400 text-sm">
                    {ability.name}
                </h4>
                {/* Description List */}
                <div className="space-y-1 mb-2">
                    {lines.map((line: string, i: number) => (
                        <div
                            key={i}
                            className="flex items-start text-xs text-gray-300 leading-relaxed"
                        >
                            {/* Only show bullet point if there is more than 1 line, looks cleaner */}
                            {lines.length > 1 && (
                                <span className="mr-2 text-blue-500 mt-0.5">
                                    •
                                </span>
                            )}
                            <span>
                                <RichTextParser text={line} />
                            </span>
                        </div>
                    ))}
                </div>
                <span className="inline-block bg-blue-900/50 text-blue-200 text-[10px] px-2 py-0.5 rounded border border-blue-500/30">
                    🕒 {ability.cooldown}s Cooldown
                </span>
            </div>
        </div>
    );
};

interface UnitCardProps {
    unit: Unit;
    isSelected: boolean;
    onSelect: () => void;
}

export const UnitCard: React.FC<UnitCardProps> = ({
    unit,
    isSelected,
    onSelect,
}) => {
    const style = RARITY_STYLES[unit.rarity] || RARITY_STYLES.Mythic;

    return (
        <div
            className="relative flex items-start"
            style={{ zIndex: isSelected ? 50 : 0 }}
        >
            <div className="flex flex-col group">
                {/* 1. THE CARD BODY (Now a Square) */}
                <div onClick={onSelect} className={'cursor-pointer group/card'}>
                    {/* --- CARD IMAGE BOX --- */}
                    <div
                        className={`
                            relative w-50 h-50 shrink-0 
                            transition-transform duration-500 ease-out mb-3
                            ${isSelected ? 'scale-105' : 'group-hover/card:scale-[1.02]'}
                        `}
                    >
                        {/* --- LAYER 1: THE GLOW --- */}
                        {/* This layer is large (-inset-3) and very blurry (blur-xl). 
                        It uses style.glowCss. */}
                        <div
                            className={`
                                absolute inset-1 rounded-xl blur-2xl transition-all duration-500
                                ${isSelected ? 'opacity-100' : 'opacity-40 group-hover/card:opacity-75'}
                            `}
                            style={{ background: style.glowCss }}
                        />

                        {/* --- LAYER 2: THE BORDER --- */}
                        {/* This layer is tight (-inset-[2px]) and sharp (no blur). 
                        It uses style.borderCss. */}
                        <div
                            className={`
                                absolute -inset-1 rounded-xl transition-opacity duration-300
                                ${isSelected ? 'opacity-100' : 'opacity-70 group-hover/card:opacity-100'}
                            `}
                            style={{ background: style.borderCss }}
                        />

                        {/* --- LAYER 3: THE CONTENT --- */}
                        {/* The solid card that sits on top of everything. */}
                        <div className="relative h-full w-full bg-gray-900 rounded-[10px] overflow-hidden">
                            <img
                                src={unit.imageUrl}
                                alt={unit.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* --- UNIT NAME (Now Transforms!) --- */}
                    {/* Added 'transition-transform' and 'group-hover:translate-x-2' */}
                    <div
                        className={`
                    w-64 text-left pl-1 
                    transition-transform duration-300 
                    ${isSelected ? 'translate-y-2' : 'group-hover/card:translate-y-1'}
                    `}
                    >
                        <h2
                            className={`
                        text-xl font-bold transition-colors duration-300 leading-none 
                        ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}
                    `}
                        >
                            {unit.name}
                        </h2>

                        {/* Underline */}
                        <div
                            className={`
                        h-1 w-16 mt-2 rounded-full transition-all duration-500
                        ${isSelected ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'}
                        `}
                            style={{ background: style.borderCss }}
                        />
                    </div>
                </div>
            </div>

            {/* 2. THE SIDEBAR (Absolute positioned relative to the flex container) */}
            {/* We use 'absolute' logic or negative margins to make it overlap neighbors if needed */}
            <div className="absolute left-68 top-4 flex flex-col pointer-events-none">
                {/* We enable pointer-events only on the children so clicking "through" the gap works */}
                <div className="pointer-events-auto">
                    <PassiveGroupSlot
                        passives={unit.passives}
                        isVisible={isSelected}
                    />
                </div>

                {unit.actives.map((ability, index) => (
                    <div key={index} className="pointer-events-auto">
                        <ActiveSlot
                            index={index}
                            ability={ability}
                            isVisible={isSelected}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
