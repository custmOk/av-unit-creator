import React, { useState, useEffect } from 'react';
import type { ActiveAbility, PassiveAbility, Rarity } from '../types';
import { supabase } from '../supabaseClient';
import { UnitCard } from './UnitCard';
import { RichInput } from './RichInput';

export const UnitCreator = () => {
    const [name, setName] = useState('');
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [mainPreview, setMainPreview] = useState<string>('');

    const [rarity, setRarity] = useState<Rarity>('Mythic');

    const [category, setCategory] = useState('Uncategorized');
    const [existingCategories, setExistingCategories] = useState<string[]>([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const { data } = await supabase.from('units').select('category');

        if (data) {
            const unique = [...new Set(data.map((u: any) => u.category))];
            setExistingCategories(unique);
        }
    }

    const [passives, setPassives] = useState<PassiveAbility[]>([]);
    const [actives, setActives] = useState<(ActiveAbility & { file?: File })[]>(
        []
    );

    const [activeTab, setActiveTab] = useState<'passive' | 'active'>('passive');

    const [tempPassive, setTempPassive] = useState<{
        name: string;
        description: string;
    }>({
        name: '',
        description: '',
    });

    const addPassive = () => {
        if (!tempPassive.name || !tempPassive.description) return;

        const descriptionArray = tempPassive.description
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line !== '');

        setPassives([
            ...passives,
            {
                name: tempPassive.name,
                description: descriptionArray,
            },
        ]);

        setTempPassive({ name: '', description: '' });
    };

    const [tempActive, setTempActive] = useState<{
        name: string;
        desc: string;
        cd: string;
        file: File | null;
    }>({
        name: '',
        desc: '',
        cd: '0',
        file: null,
    });

    const [isUploading, setIsUploading] = useState(false);

    const uploadFile = async (file: File, path: string) => {
        const { error } = await supabase.storage.from('unit-images').upload(path, file);

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage.from('unit-images').getPublicUrl(path);

        return publicUrlData.publicUrl;
    };

    const addActive = () => {
        if (!tempActive.name || !tempActive.desc || !tempActive.file) return;

        // Create a local URL for the preview immediately
        const previewUrl = URL.createObjectURL(tempActive.file);

        const descriptionArray = tempActive.desc.split('\n').map(line => line.trim()).filter(line => line !== '');

        setActives([
            ...actives,
            {
                name: tempActive.name,
                description: descriptionArray,
                cooldown: parseInt(tempActive.cd),
                iconUrl: previewUrl,
                file: tempActive.file,
            },
        ]);

        setTempActive({ name: '', desc: '', cd: '0', file: null });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mainImage) return alert("Please select a main unit image!");

        setIsUploading(true);

        try {
            const timestamp = Date.now();

            const mainImagePath = `units/${timestamp}_${mainImage.name}`;
            const mainImageUrl = await uploadFile(mainImage, mainImagePath);

            const finalActives = await Promise.all(actives.map(async (ability) => {
                let iconUrl = ability.iconUrl;

                if (ability.file) {
                    const iconPath = `icons/${timestamp}_${ability.name}_${ability.file.name}`;
                    iconUrl = await uploadFile(ability.file, iconPath);
                }

                return {
                    name: ability.name,
                    description: ability.description,
                    cooldown: ability.cooldown,
                    iconUrl: iconUrl
                };
            }));

            const { error } = await supabase.from('units').insert([
                {
                    name: name,
                    rarity: rarity,
                    category: category,
                    image_url: mainImageUrl,
                    passives: passives,
                    actives: finalActives
                }
            ]);

            if (error) throw error;

            alert("Unit Saved Successfully");
        } catch (error) {
            console.error("Error saving unit:", error);
            alert("Error saving unit. Check console.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex gap-8 max-w-4xl mx-auto p-6 items-start">
            {/* --- LEFT: THE FORM --- */}
            <form
                onSubmit={handleSubmit}
                className="flex-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit"
            >
                <h2 className="text-xl text-white font-bold mb-6">
                    Unit Factory
                </h2>

                {/* Core Stats */}
                <div className="flex gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Unit Name"
                        className="flex-1 bg-gray-900 text-white p-2 rounded border border-gray-600 focus:border-blue-500 outline-none"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* --- NEW: CATEGORY INPUT --- */}
                <div className="mb-6">
                <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Unit Category</label>
                <div className="relative">
                    <input 
                    type="text" 
                    list="category-suggestions" // Connects to the datalist below
                    className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:border-blue-500 outline-none"
                    placeholder="e.g. Mage, Tank, Boss..."
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    />
                    {/* HTML Datalist provides autocomplete suggestions based on DB data */}
                    <datalist id="category-suggestions">
                    {existingCategories.map(cat => (
                        <option key={cat} value={cat} />
                    ))}
                    </datalist>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                    * Type a new name to create a category, or select an existing one.
                </p>
                </div>

                {/* Rarity Selector Row */}
                <div className="mb-6">
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                        Rarity
                    </label>
                    <select
                        value={rarity}
                        onChange={(e) => setRarity(e.target.value as Rarity)}
                        className="w-full mt-1 bg-gray-900 text-white p-2 rounded border border-gray-600 outline-none focus:border-blue-500"
                    >
                        <option value="Vanguard">Vanguard</option>
                        <option value="Secret">Secret</option>
                        <option value="Exclusive">Exclusive</option>
                        <option value="Mythic">Mythic</option>
                        <option value="Legendary">Legendary</option>
                        <option value="Epic">Epic</option>
                        <option value="Rare">Rare</option>
                    </select>
                </div>

                {/* Image Upload */}
                <div className="mb-6 pb-6 border-b border-gray-700">
                    <label className="block text-sm text-gray-400 mb-1">
                        Unit Image
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                        onChange={(e) => {
                            if (e.target.files) {
                                setMainImage(e.target.files[0]);
                                // Basic preview logic
                                const url = URL.createObjectURL(
                                    e.target.files[0]
                                );
                                setMainPreview(url);
                            }
                        }}
                    />
                </div>

                {/* Ability Tabs */}
                <div className="flex mb-4 border-b border-gray-700">
                    <button
                        type="button"
                        onClick={() => setActiveTab('passive')}
                        className={`pb-2 px-4 text-sm font-medium ${activeTab === 'passive' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}
                    >
                        Add Passive
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('active')}
                        className={`pb-2 px-4 text-sm font-medium ${activeTab === 'active' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
                    >
                        Add Active
                    </button>
                </div>

                {/* Ability Inputs */}
                <div className="bg-gray-900 p-4 rounded mb-6">
                    {activeTab === 'passive' ? (
                        <div className="space-y-4">
                            <input
                                placeholder="Passive Name"
                                className="w-full bg-gray-800 text-white p-2 rounded text-sm border border-gray-700 focus:border-yellow-500 outline-none"
                                value={tempPassive.name}
                                onChange={(e) =>
                                    setTempPassive({
                                        ...tempPassive,
                                        name: e.target.value,
                                    })
                                }
                            />

                            {/* 2. PASSIVE DESCRIPTION (Auto-colors numbers) */}
                            <div>
                                <label className="text-xs text-gray-500 font-bold ml-1">
                                    Description
                                </label>
                                <RichInput
                                    value={tempPassive.description}
                                    onChange={(val) =>
                                        setTempPassive({
                                            ...tempPassive,
                                            description: val,
                                        })
                                    }
                                    placeholder="Description (Numbers like 50% are auto-colored)"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={addPassive}
                                className="w-full bg-yellow-600/20 text-yellow-400 border border-yellow-600/50 py-2 rounded hover:bg-yellow-600/40"
                            >
                                + Add Passive
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    placeholder="Active Name"
                                    className="flex-1 bg-gray-800 text-white p-2 rounded text-sm"
                                    value={tempActive.name}
                                    onChange={(e) =>
                                        setTempActive({
                                            ...tempActive,
                                            name: e.target.value,
                                        })
                                    }
                                />
                                <input
                                    type="number"
                                    placeholder="CD (s)"
                                    className="w-20 bg-gray-800 text-white p-2 rounded text-sm"
                                    value={tempActive.cd}
                                    onChange={(e) =>
                                        setTempActive({
                                            ...tempActive,
                                            cd: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                onChange={(e) =>
                                    e.target.files &&
                                    setTempActive({
                                        ...tempActive,
                                        file: e.target.files[0],
                                    })
                                }
                            />
                            <div>
                                <RichInput
                                    value={tempActive.desc}
                                    onChange={(val) =>
                                        setTempActive({ ...tempActive, desc: val })
                                    }
                                    placeholder="Active Description (Highlight words to color them)"
                                />
                                <span className="text-[10px] text-gray-500 block mt-1">
                                    Separate distinct effects with a new line.
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={addActive}
                                className="w-full bg-blue-600/20 text-blue-400 border border-blue-600/50 py-2 rounded hover:bg-blue-600/40"
                            >
                                + Add Active
                            </button>
                        </div>
                    )}
                </div>

                <button
                    disabled={isUploading}
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition-colors"
                >
                    {isUploading ? 'Uploading & Saving...' : 'Upload Unit to Server'}
                </button>
            </form>

            {/* --- RIGHT: LIVE PREVIEW --- */}
            <div className="hidden lg:block sticky top-6 h-fit">
                <h3 className="text-gray-500 uppercase tracking-widest text-xs mb-4">
                    Live Preview
                </h3>
                <div className="transform scale-90 origin-top-left">
                    <UnitCard
                        // We force it to be selected so the user can see their edits live
                        isSelected={true}
                        onSelect={() => {}} // Do nothing on click in preview
                        unit={{
                            id: 'preview',
                            name: name || 'Unit Name',
                            imageUrl:
                                mainPreview || 'https://placehold.co/300x300',
                            category: category,
                            rarity: rarity,
                            passives: passives,
                            actives: actives,
                        }}
                    />
                    <p className="text-gray-500 text-xs mt-20 max-w-62.5">
                        * Preview mode: Card is locked 'Open'.
                    </p>
                </div>
            </div>
        </div>
    );
};
