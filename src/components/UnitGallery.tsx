import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import type { Unit, Rarity } from '../types';
import { UnitCard } from './UnitCard';

const RARITY_WEIGHTS: Record<string, number> = {
    Vanguard: 7,
    Secret: 6,
    Exclusive: 5,
    Mythic: 4,
    Legendary: 3,
    Epic: 2,
    Rare: 1,
};

const RARITY_COLORS: Record<string, string> = {
    Vanguard:
        'linear-gradient(150deg, #8369c5 10%, #999999 30%, #ffffff 50%, #999999 70%, #8369c5 90%)',
    Secret: 'linear-gradient(150deg, #c60000 10%, #500000 45%, #f40000 80%)',
    Exclusive: 'linear-gradient(150deg, #ec0004 10%, #e385ef 90%)',
    Mythic: 'linear-gradient(-125deg, #33ffcc 15%, #45ff41, #d6ff33, #fdd233, #ff7c33, #ff3346, #ff33b7 85%)',
    Legendary: 'linear-gradient(150deg, #f1ff00 10%, #ff6f00 45%, #ffff00 80%)',
    Epic: 'linear-gradient(150deg, #b20eff 10%, #3e00d4, #ae04ff 80%)',
    Rare: 'linear-gradient(150deg, #08f3ff 10%, #2747d3, #03c6ff)',
};

export const UnitGallery = () => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const [openRarities, setOpenRarities] = useState<Set<string>>(
        new Set([
            'Vanguard',
            'Secret',
            'Exclusive',
            'Mythic',
            'Legendary',
            'Epic',
            'Rare',
        ])
    );

    const toggleRarity = (rarity: string) => {
        const newSet = new Set(openRarities);
        if (newSet.has(rarity)) {
            newSet.delete(rarity);
        } else {
            newSet.add(rarity);
        }
        setOpenRarities(newSet);
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        // Select all columns from 'units' table
        const { data, error } = await supabase.from('units').select('*');

        if (error) {
            console.error('Error fetching units:', error);
        } else {
            // Map database snake_case to your TypeScript camelCase if necessary
            // Since we defined the table columns as snake_case in SQL but Types as camelCase
            const formattedUnits: Unit[] = (data || []).map((row: any) => ({
                id: row.id,
                name: row.name,
                rarity: row.rarity as Rarity,
                category: row.category || 'Uncategorized',
                imageUrl: row.image_url, // Map image_url -> imageUrl
                passives: row.passives,
                actives: row.actives,
                customKeywords: row.custom_keywords, // If you added this column too
            }));

            formattedUnits.sort((a, b) => {
                const weightA = RARITY_WEIGHTS[a.rarity] || 0;
                const weightB = RARITY_WEIGHTS[b.rarity] || 0;

                if (weightA !== weightB) {
                    return weightB - weightA;
                }

                return a.name.localeCompare(b.name);
            });

            setUnits(formattedUnits);
        }
        setLoading(false);
    };

    const categories = useMemo(() => {
        const unique = new Set(units.map((u) => u.category));
        // Sort them alphabetically, but put 'Uncategorized' at end if you want
        return ['All', ...Array.from(unique).sort()];
    }, [units]);

    const groupedUnits = useMemo(() => {
        // Step A: Filter by Category
        const filtered = units.filter(
            (u) => selectedCategory === 'All' || u.category === selectedCategory
        );

        // Step B: Group by Rarity
        const groups: Record<string, Unit[]> = {};
        filtered.forEach((u) => {
            if (!groups[u.rarity]) groups[u.rarity] = [];
            groups[u.rarity].push(u);
        });

        // Step C: Sort the groups by Rarity Weight
        // We return an array of objects: { rarity: 'Legendary', units: [...] }
        return Object.keys(groups)
            .sort((a, b) => (RARITY_WEIGHTS[b] || 0) - (RARITY_WEIGHTS[a] || 0))
            .map((rarity) => ({
                rarity,
                units: groups[rarity].sort((a, b) =>
                    a.name.localeCompare(b.name)
                ), // Sort units A-Z inside the group
            }));
    }, [units, selectedCategory]);

    if (loading)
        return (
            <div className="text-white text-center p-10">
                Loading Unit Database...
            </div>
        );

    return (
        <div className="flex flex-col items-center w-full min-h-[50vh]">
            {/* --- CATEGORY FILTER TABS --- */}
            <div className="flex flex-wrap gap-2 justify-center mb-8 bg-gray-900/50 p-4 rounded-full border border-gray-800 backdrop-blur-sm sticky top-4 z-40 shadow-xl">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300
                            ${
                                selectedCategory === cat
                                ? 'bg-blue-600 text-white shadow-lg scale-105'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                            }
                            `}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* --- RARITY DROPDOWNS --- */}
            <div className="w-full max-w-7xl space-y-6">
                {groupedUnits.map((group) => {
                    const isOpen = openRarities.has(group.rarity);
                    const headerColor =
                        RARITY_COLORS[group.rarity] || 'bg-gray-700';

                    return (
                        <div key={group.rarity} className="w-full">
                            {/* DROPDOWN HEADER */}
                            <button
                                onClick={() => toggleRarity(group.rarity)}
                                className={`
                                    w-full flex items-center justify-between px-6 py-3 rounded-lg
                                    shadow-lg transition-all duration-300 hover:brightness-110${headerColor}
                                    `}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Chevron Icon that rotates */}
                                    <svg
                                        className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>

                                    <span className="text-lg text-white drop-shadow-md">
                                        {group.rarity}
                                    </span>

                                    {/* Count Badge */}
                                    <span className="bg-black/30 px-2 py-0.5 rounded text-xs font-mono text-white/90">
                                        {group.units.length}
                                    </span>
                                </div>
                            </button>

                            {/* DROPDOWN CONTENT (The Grid) */}
                            <div
                                className={`
                                    transition-all duration-500 ease-in-out
                                    ${
                                        isOpen
                                        ? 'max-h-500 opacity-100 mt-6'
                                        : 'max-h-0 opacity-0 mt-0'
                                    }
                                    `}
                            >
                                <div className="flex flex-wrap gap-16 justify-center items-start pb-4">
                                    {group.units.map((unit) => (
                                        <UnitCard
                                            key={unit.id}
                                            unit={unit}
                                            isSelected={selectedId === unit.id}
                                            onSelect={() =>
                                                setSelectedId(
                                                    selectedId === unit.id
                                                        ? null
                                                        : unit.id!
                                                )
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {groupedUnits.length === 0 && (
                    <div className="text-gray-500 text-center mt-10 italic">
                        No units found in this category.
                    </div>
                )}
            </div>
        </div>
    );
};
