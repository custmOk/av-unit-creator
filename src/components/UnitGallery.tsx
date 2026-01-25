import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { Unit, Rarity } from '../types';
import { UnitCard } from './UnitCard';

const RARITY_WEIGHTS: Record<string, number> = {
    'Vanguard': 7,
    'Secret': 6,
    'Exclusive': 5,
    'Mythic': 4,
    'Legendary': 3,
    'Epic': 2,
    'Rare': 1,
};

export const UnitGallery = () => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        // Select all columns from 'units' table
        const { data, error } = await supabase
            .from('units')
            .select('*')

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
                imageUrl: row.image_url, // Map image_url -> imageUrl
                passives: row.passives,
                actives: row.actives,
                customKeywords: row.custom_keywords, // If you added this column too
            }));

            formattedUnits.sort((a, b) => {
                const weightA = RARITY_WEIGHTS[a.rarity] || 0;
                const weightB = RARITY_WEIGHTS[b.rarity] || 0;

                if (weightA !== weightB) {
                    return weightB - weightA
                }

                return a.name.localeCompare(b.name);
            })

            setUnits(formattedUnits);
        }
        setLoading(false);
    };

    if (loading)
        return (
            <div className="text-white text-center p-10">
                Loading Unit Database...
            </div>
        );

    return (
        <div className="flex flex-wrap gap-16 p-12 justify-center items-start">
            {units.map((unit) => (
                <UnitCard
                    key={unit.id}
                    unit={unit}
                    isSelected={selectedId === unit.id}
                    onSelect={() =>
                        setSelectedId(selectedId === unit.id ? null : unit.id!)
                    }
                />
            ))}

            {units.length === 0 && (
                <div className="text-gray-500 italic">No units found in database.</div>
            )}
        </div>
    );
};
