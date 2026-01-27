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

export const UnitGallery = () => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

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
                hp: row.hp,
                rarity: row.rarity as Rarity,
                category: row.category,
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

    const filteredUnits = units.filter((unit) => {
        if (selectedCategory === 'All') return true;
        return unit.category === selectedCategory;
    });

    if (loading)
        return (
            <div className="text-white text-center p-10">
                Loading Unit Database...
            </div>
        );

    return (
        <div className="flex flex-col items-center w-full">
            {/* --- FILTER BAR --- */}
            <div className="flex flex-wrap gap-2 justify-center mb-8 bg-gray-900/50 p-4 rounded-full border border-gray-800 backdrop-blur-sm sticky top-4 z-40 shadow-xl">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`
              px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300
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

            {/* --- THE GRID --- */}
            <div className="flex flex-wrap gap-16 p-4 justify-center items-start w-full">
                {filteredUnits.map((unit) => (
                    <UnitCard
                        key={unit.id}
                        unit={unit}
                        isSelected={selectedId === unit.id}
                        onSelect={() =>
                            setSelectedId(
                                selectedId === unit.id ? null : unit.id!
                            )
                        }
                    />
                ))}

                {filteredUnits.length === 0 && (
                    <div className="text-gray-500 italic mt-10">
                        No units found in "{selectedCategory}".
                    </div>
                )}
            </div>
        </div>
    );
};
