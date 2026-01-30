import React, { useState, useEffect } from 'react';
import type { ActiveAbility, PassiveAbility, Rarity, Unit } from '../types';
import { supabase } from '../supabaseClient';
import { UnitCard } from './UnitCard';
import { PassiveEditor } from './PassiveEditor';
import { ActiveEditor } from './ActiveEditor';
import { CategorySelect } from './CategorySelect';

interface Props {
    session: any;
    unitToEdit?: Unit | null;
    onCancelEdit?: () => void;
}

export const UnitCreator: React.FC<Props> = ({
    session,
    unitToEdit,
    onCancelEdit,
}) => {
    // --- BASIC INFO STATE ---
    const [name, setName] = useState('');
    const [rarity, setRarity] = useState<Rarity>('Mythic');
    const [category, setCategory] = useState('');
    const [existingCategories, setExistingCategories] = useState<string[]>([]);

    // --- IMAGE STATE ---
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [mainPreview, setMainPreview] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);

    // --- ABILITY STATE ---
    const [passives, setPassives] = useState<PassiveAbility[]>([]);
    const [actives, setActives] = useState<
        (ActiveAbility & { file?: File | null })[]
    >([]);
    const [activeTab, setActiveTab] = useState<'passive' | 'active'>('passive');

    // --- INITIALIZATION ---
    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (unitToEdit) {
            setName(unitToEdit.name);
            setRarity(unitToEdit.rarity);
            setCategory(unitToEdit.category || '');
            setPassives(unitToEdit.passives || []);
            setActives(unitToEdit.actives || []);
            if (unitToEdit.imageUrl) setMainPreview(unitToEdit.imageUrl);
        } else {
            resetForm();
        }
    }, [unitToEdit]);

    // --- UPLOAD HELPERS ---
    const uploadFile = async (file: File, path: string) => {
        const { error } = await supabase.storage
            .from('unit-images')
            .upload(path, file);

        if (error) throw error;

        const { data } = supabase.storage
            .from('unit-images')
            .getPublicUrl(path);

        return data.publicUrl;
    };

    // --- MAIN SUBMIT ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session?.user) return alert('You must be logged in to save units');

        setIsUploading(true);

        try {
            const timestamp = Date.now();
            let finalMainImageUrl = unitToEdit?.imageUrl || '';

            // 1. Upload Main Image
            if (mainImage) {
                const path = `units/${timestamp}_${mainImage.name}`;
                finalMainImageUrl = await uploadFile(mainImage, path);
            } else if (!finalMainImageUrl) {
                setIsUploading(false);
                return alert('Please select a main unit image!');
            }

            // 2. Upload Active Ability Icons
            const finalActives = await Promise.all(
                actives.map(async (ability) => {
                    if (ability.file) {
                        const iconPath = `icons/${timestamp}_${ability.name}_${ability.file.name}`;
                        const newUrl = await uploadFile(ability.file, iconPath);
                        return { ...ability, iconUrl: newUrl, file: undefined };
                    }

                    return ability;
                })
            );

            // 3. Construct Data Packet
            const unitData = {
                name,
                rarity,
                category,
                image_url: finalMainImageUrl,
                passives,
                actives: finalActives,
                user_id: session.user.id,
            };

            // 4. Update to Supabase
            if (unitToEdit) {
                const { error } = await supabase
                    .from('units')
                    .update(unitData)
                    .eq('id', unitToEdit.id);

                if (error) throw error;
                alert('Unit Updated Successfully!');
                if (onCancelEdit) onCancelEdit();
            } else {
                const { error } = await supabase
                    .from('units')
                    .insert([unitData]);

                if (error) throw error;
                alert('Unit Created Successfully!');
                resetForm();
            }
        } catch (error: any) {
            console.error('Error saving unit:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    // --- HELPER FUNCTIONS ---
    const fetchCategories = async () => {
        const { data } = await supabase.from('units').select('category');

        if (data) {
            const unique = [...new Set(data.map((u: any) => u.category))];
            setExistingCategories(unique);
        }
    };

    const resetForm = () => {
        setName('');
        setRarity('Mythic');
        setCategory('');
        setPassives([]);
        setActives([]);
        setMainImage(null);
    };

    return (
        <div className="flex gap-8 max-w-5xl mx-auto p-6 items-start">
            {/* --- LEFT: FORM --- */}
            <form
                onSubmit={handleSubmit}
                className="flex-1 bg-gray-800 p-6 rounded-lg border border-gray-700"
            >
                <h2 className="text-xl text-white font-bold mb-4">
                    Unit Factory
                </h2>

                {/* EDIT MODE BANNER */}
                {unitToEdit && (
                    <div className="mb-6 bg-yellow-900/40 border border-yellow-600/50 p-4 rounded flex justify-between items-center">
                        <div>
                            <h3 className="text-yellow-400 font-bold uppercase tracking-wider text-xs">
                                Edit Mode
                            </h3>
                            <p className="text-yellow-200/80 text-xs">
                                Updating:{' '}
                                <span className="font-bold">
                                    {unitToEdit.name}
                                </span>
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            className="text-xs bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-300 px-3 py-1.5 rounded border border-yellow-600/30"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* BASIC INFO */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">
                            Unit Name
                        </label>
                        <input
                            type="text"
                            className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:border-blue-500 outline-none"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">
                            Rarity
                        </label>
                        <select
                            value={rarity}
                            onChange={(e) =>
                                setRarity(e.target.value as Rarity)
                            }
                            className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 outline-none focus:border-blue-500"
                        >
                            {[
                                'Vanguard',
                                'Secret',
                                'Exclusive',
                                'Mythic',
                                'Legendary',
                                'Epic',
                                'Rare',
                            ].map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">
                        Category
                    </label>
                    <CategorySelect
                        value={category}
                        onChange={setCategory}
                        categories={existingCategories}
                    />
                    <p className="text-[10px] text-gray-600 mt-1 ml-1">
                        * Select an existing category or type to create a new one.
                    </p>
                </div>

                <div className="mb-6 pb-6 border-b border-gray-700">
                    <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">
                        Unit Image
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                        onChange={(e) => {
                            if (e.target.files) {
                                setMainImage(e.target.files[0]);
                                setMainPreview(
                                    URL.createObjectURL(e.target.files[0])
                                );
                            }
                        }}
                    />
                </div>

                {/* --- ABILITIES SECTION --- */}
                <div className="flex mb-2 border-b border-gray-700">
                    <button
                        type="button"
                        onClick={() => setActiveTab('passive')}
                        className={`pb-2 px-4 text-sm font-bold transition-colors ${activeTab === 'passive' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Passives
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('active')}
                        className={`pb-2 px-4 text-sm font-bold transition-colors ${activeTab === 'active' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Actives
                    </button>
                </div>

                <div className="bg-gray-900 p-4 rounded mb-6 min-h-75">
                    {activeTab === 'passive' ? (
                        <PassiveEditor
                            passives={passives}
                            setPassives={setPassives}
                        />
                    ) : (
                        <ActiveEditor
                            actives={actives}
                            setActives={setActives}
                        />
                    )}
                </div>

                {/* SUBMIT BUTTON */}
                <button
                    type="submit"
                    disabled={isUploading}
                    className={`w-full font-bold py-3 rounded transition-colors ${
                        unitToEdit
                            ? 'bg-yellow-600 hover:bg-yellow-500'
                            : 'bg-green-600 hover:bg-green-500'
                    } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isUploading
                        ? 'Saving...'
                        : unitToEdit
                          ? 'Update Unit'
                          : 'Create Unit'}
                </button>
            </form>

            {/* --- RIGHT: LIVE PREVIEW --- */}
            <div className="hidden lg:block sticky top-6">
                <h3 className="text-gray-500 uppercase tracking-widest text-xs mb-4">
                    Live Preview
                </h3>
                <div className="transform scale-90 origin-top-left">
                    <UnitCard
                        isSelected={true}
                        onSelect={() => {}}
                        unit={{
                            id: 'preview',
                            name: name || 'Unit Name',
                            imageUrl:
                                mainPreview || 'https://placehold.co/300x300',
                            category: category,
                            rarity: rarity,
                            passives: passives,
                            actives: actives,
                            userId: 'preview',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
