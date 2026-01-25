import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { Unit } from '../types';
import { UnitCard } from './UnitCard';

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
            .order('created_at', { ascending: false }); // Newest first

        if (error) {
            console.error('Error fetching units:', error);
        } else {
            // Map database snake_case to your TypeScript camelCase if necessary
            // Since we defined the table columns as snake_case in SQL but Types as camelCase
            const formattedUnits: Unit[] = (data || []).map((row: any) => ({
                id: row.id,
                name: row.name,
                hp: row.hp,
                rarity: row.rarity,
                imageUrl: row.image_url, // Map image_url -> imageUrl
                passives: row.passives,
                actives: row.actives,
                customKeywords: row.custom_keywords, // If you added this column too
            }));

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
        </div>
    );
};
