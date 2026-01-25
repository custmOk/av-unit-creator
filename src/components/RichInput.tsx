import React, { useRef, useState } from 'react';

interface Preset {
    label: string;
    color: string;
}

interface PresetGroup {
    category: string;
    items: Preset[];
}

interface Props {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
}

export const RichInput: React.FC<Props> = ({
    value,
    onChange,
    placeholder,
    className,
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // --- 1. DEFINED PALETTE ---
    const [groups] = useState<PresetGroup[]>([
        {
            category: 'Title',
            items: [
                { label: 'Changed Value', color: '#30C23D' },
                { label: "Conditional", color: '#6BF5FA' },
                { label: "When 'x' Happens", color: '#FF7B1C' },
                { label: 'PvP Only', color: '#30C23D' },
            ],
        },
        {
            category: 'Damage Over Time',
            items: [
                { label: 'Black Flame', color: '#FFFFFF' },
                { label: 'Bleed', color: '#D40D11' },
                { label: 'Burn', color: '#FFA200' },
                { label: 'Intense Burn', color: '#FF0000' },
            ],
        },
        {
            category: 'Crowd Control',
            items: [
                { label: 'Aura of Corruption', color: '#321315' },
                { label: 'Confusion', color: '#EA5AFF' },
                { label: 'Freeze', color: '#09BAFF' },
                { label: 'Frostburn', color: '#4BF0FF' },
                { label: 'Infinite Spin', color: '#FDD4F9' },
                { label: 'Petrified', color: '#FF0067' },
                { label: 'Repulse', color: '#18D466' },
                { label: 'Slow', color: '#7D7D7D' },
                { label: 'Stun', color: '#6937FF' },
                { label: 'Timestop', color: '#808080' },
            ],
        },
        {
            category: 'Damage Amplification',
            items: [
                { label: 'Bubbled', color: '#A3D6F7' },
                { label: 'Cleave', color: '#630002' },
                { label: 'Conduit', color: '#FF7A22' },
                { label: 'Despair', color: '#9111B5' },
                { label: 'Diseased', color: '#ABFFB4' },
                { label: 'Purgatory Flames', color: '#7A050D' },
                { label: 'Scorched', color: '#09BAFF' },
                { label: 'Wanted', color: '#FFD700' },
                { label: 'Wounded', color: '#940582' },
            ],
        },
        {
            category: 'Other',
            items: [
                { label: 'Affection', color: '#FFAEDE' },
                { label: 'Nullify', color: '#D64BAC' },
                { label: 'Rupture', color: '#D40D11' },
                { label: 'Tethered', color: '#A07C5C' },
            ],
        },
    ]);

    // --- 2. APPLY LOGIC ---
    const applyColor = (preset: any) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // If no text is selected, just insert an empty tag or do nothing
        if (start === end) return;

        const selectedText = value.substring(start, end);
        const before = value.substring(0, start);
        const after = value.substring(end);

        // Create the Tag: [Color|Text]
        const newValue = `${before}[${preset.color}|${selectedText}]${after}`;

        onChange(newValue);

        // Restore focus
        setTimeout(() => textarea.focus(), 0);
    };

    return (
        <div className="flex flex-col gap-2">
            {/* --- TOOLBAR CONTAINER --- */}
            <div className="bg-gray-900/50 p-3 rounded border border-gray-700 flex flex-col gap-3">
                {groups.map((group) => (
                    <div
                        key={group.category}
                        className="flex flex-col flex-wrap items-start gap-2"
                    >
                        {/* Category Label */}
                        <span className="text-[10px] text-gray-500 uppercase font-bold w-32 shrink-0">
                            {group.category}
                        </span>

                        {/* Buttons */}
                        <div className="flex flex-wrap gap-1.5">
                            {group.items.map((p) => (
                                <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => applyColor(p)}
                                    className="px-2 py-0.5 text-[10px] font-bold rounded border border-gray-600 bg-gray-800 hover:brightness-125 hover:border-gray-400 transition-all"
                                    style={{ color: p.color }}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* INPUT AREA */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-blue-500 outline-none font-mono text-sm ${className || 'h-24'}`}
            />

            <p className="text-[10px] text-gray-500">
                * Highlight text above and click a button to color it.
            </p>
        </div>
    );
};
