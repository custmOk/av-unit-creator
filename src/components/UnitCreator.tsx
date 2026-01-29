import React, { useState, useEffect } from 'react';
import type { ActiveAbility, PassiveAbility, Rarity, Unit } from '../types';
import { supabase } from '../supabaseClient';
import { UnitCard } from './UnitCard';
import { RichInput } from './RichInput';
import { RichTextParser } from './RichTextParser';

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
    const [name, setName] = useState('');
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [mainPreview, setMainPreview] = useState<string>('');

    const [rarity, setRarity] = useState<Rarity>('Mythic');

    const [category, setCategory] = useState('');
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
    };

    const [passives, setPassives] = useState<PassiveAbility[]>([]);
    const [actives, setActives] = useState<
        (ActiveAbility & { file?: File | null })[]
    >([]);

    const [activeTab, setActiveTab] = useState<'passive' | 'active'>('passive');

    const [editingPassiveIndex, setEditingPassiveIndex] = useState<
        number | null
    >(null);
    const [editingActiveIndex, setEditingActiveIndex] = useState<number | null>(
        null
    );

    const startEditingPassive = (index: number) => {
        const p = passives[index];
        setTempPassive({
            name: p.name,
            description: p.description.join('\n'),
        });
        setEditingPassiveIndex(index);
    };

    const handlePassiveSubmit = () => {
        if (!tempPassive.name || !tempPassive.description) return;

        const descArray = tempPassive.description
            .split('\n')
            .filter((l) => l.trim() != '');

        const newPassiveObj = {
            name: tempPassive.name,
            description: descArray,
        };

        if (editingPassiveIndex !== null) {
            const updatedList = [...passives];
            updatedList[editingPassiveIndex] = newPassiveObj;
            setPassives(updatedList);
            setEditingPassiveIndex(null);
        } else {
            setPassives([...passives, newPassiveObj]);
        }

        setTempPassive({ name: '', description: '' });
    };

    const startEditingActive = (index: number) => {
        const a = actives[index];
        setTempActive({
            name: a.name,
            desc: a.description.join('\n'),
            cd: a.cooldown.toString(),
            file: null,
        });

        setEditingActiveIndex(index);
    };

    const handleActiveSubmit = () => {
        if (!tempActive.name || !tempActive.desc) return;

        let iconUrlToUse = '';

        if (tempActive.file) {
            iconUrlToUse = URL.createObjectURL(tempActive.file);
        } else if (editingActiveIndex !== null) {
            iconUrlToUse = actives[editingActiveIndex].iconUrl;
        } else {
            return alert('Please upload an icon');
        }

        const descArray = tempActive.desc
            .split('\n')
            .filter((l) => l.trim() !== '');

        const newActiveObj = {
            name: tempActive.name,
            description: descArray,
            cooldown: parseInt(tempActive.cd) || 0,
            iconUrl: iconUrlToUse,
            file: tempActive.file,
        };

        if (editingActiveIndex !== null) {
            const updatedList = [...actives];
            updatedList[editingActiveIndex] = newActiveObj;
            setActives(updatedList);
            setEditingActiveIndex(null);
        } else {
            setActives([...actives, newActiveObj]);
        }

        setTempActive({ name: '', desc: '', cd: '0', file: null });
    };

    const [tempPassive, setTempPassive] = useState<{
        name: string;
        description: string;
    }>({
        name: '',
        description: '',
    });

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
        const { error } = await supabase.storage
            .from('unit-images')
            .upload(path, file);

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
            .from('unit-images')
            .getPublicUrl(path);

        return publicUrlData.publicUrl;
    };

    const removePassive = (indexToRemove: number) => {
        setPassives(passives.filter((_, index) => index !== indexToRemove));
    };

    const removeActive = (indexToRemove: number) => {
        const activeToRemove = actives[indexToRemove];
        if (activeToRemove.iconUrl) {
            URL.revokeObjectURL(activeToRemove.iconUrl);
        }

        setActives(actives.filter((_, index) => index !== indexToRemove));
    };

    useEffect(() => {
        if (unitToEdit) {
            setName(unitToEdit.name);
            setRarity(unitToEdit.rarity);
            setCategory(unitToEdit.category || 'Uncategorized');
            setPassives(unitToEdit.passives || []);
            setActives(unitToEdit.actives || []);
        } else {
            resetForm();
        }
    }, [unitToEdit]);

    const resetForm = () => {
        setName('');
        setRarity('Mythic');
        setCategory('Uncategorized');
        setPassives([]);
        setActives([]);
        setMainImage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session?.user) return alert('You must be logged in to save units');

        setIsUploading(true);

        try {
            const timestamp = Date.now();
            let finalMainImageUrl = '';

            if (mainImage) {
                const path = `units/${timestamp}_${mainImage.name}`;
                finalMainImageUrl = await uploadFile(mainImage, path);
            } else if (unitToEdit && unitToEdit.imageUrl) {
                finalMainImageUrl = unitToEdit.imageUrl;
            } else {
                setIsUploading(false);
                return alert('Please select a main unit image!');
            }

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

            const unitData = {
                name,
                rarity,
                category,
                image_url: finalMainImageUrl,
                passives,
                actives: finalActives,
                user_id: session.user.id,
            };

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

                {/* --- NEW: EDIT MODE BANNER --- */}
                {unitToEdit && (
                    <div className="mb-6 bg-yellow-900/40 border border-yellow-600/50 p-4 rounded flex justify-between items-center">
                        <div>
                            <h3 className="text-yellow-400 font-bold uppercase tracking-wider text-sm">
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
                            className="text-xs bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-300 px-3 py-1.5 rounded border border-yellow-600/30 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* --- Name --- */}
                <div className="mb-6">
                    <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">
                        Unit Name
                    </label>
                    <input
                        type="text"
                        placeholder="Unit Name"
                        className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:border-blue-500 outline-none"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* --- Category --- */}
                <div className="mb-5">
                    <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">
                        Unit Category
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            list="category-suggestions"
                            className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:border-blue-500 outline-none"
                            placeholder="Unit Category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                        {/* HTML Datalist provides autocomplete suggestions based on DB data */}
                        <datalist id="category-suggestions">
                            {existingCategories.map((cat) => (
                                <option key={cat} value={cat} />
                            ))}
                        </datalist>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                        * Type a new name to create a category, or select an
                        existing one.
                    </p>
                </div>

                {/* --- Rarity --- */}
                <div className="mb-6">
                    <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">
                        Unit Category
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

                {/* --- Image Upload --- */}
                <div className="mb-6 pb-6 border-b border-gray-700">
                    <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">
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

                {/* --- Tabs --- */}
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

                {/* --- Ability Inputs --- */}
                <div className="bg-gray-900 p-4 rounded mb-6">
                    {activeTab === 'passive' ? (
                        <div className="space-y-4">
                            {/* --- Passive Name --- */}
                            <label className="text-xs text-gray-500 font-bold ml-1">
                                Name
                            </label>
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

                            {/* --- Passive Description --- */}
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
                                    placeholder="Description"
                                />
                            </div>

                            {/* BUTTONS ROW */}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handlePassiveSubmit}
                                    className={`flex-1 py-2 rounded font-bold transition-colors ${
                                        editingPassiveIndex !== null
                                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                            : 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/50 hover:bg-yellow-600/40'
                                    }`}
                                >
                                    {editingPassiveIndex !== null
                                        ? 'Update Passive'
                                        : '+ Add Passive'}
                                </button>

                                {/* CANCEL BUTTON (Only shows when editing) */}
                                {editingPassiveIndex !== null && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingPassiveIndex(null);
                                            setTempPassive({
                                                name: '',
                                                description: '',
                                            });
                                        }}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>

                            {/* --- LIST OF ADDED PASSIVES (With Delete Button) --- */}
                            <div className="mt-4 space-y-2">
                                {passives.map((p, i) => (
                                    <div
                                        key={i}
                                        className={`flex justify-between items-start bg-gray-800 p-3 rounded border border-gray-700 group
                                            ${editingPassiveIndex === i ? 'bg-blue-900/20 border-blue-500' : 'bg-gray-800 border-gray-700'}
                                            `}
                                    >
                                        <div className="text-sm">
                                            <span className="font-bold text-yellow-500 block mb-1">
                                                <RichTextParser text={p.name} />
                                            </span>
                                            <p className="text-xs text-gray-400 line-clamp-1">
                                                {p.description[0]}{' '}
                                                {/* Show first line as preview */}
                                            </p>
                                        </div>

                                        <div className="flex gap-1">
                                            {/* EDIT BUTTON */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    startEditingPassive(i)
                                                }
                                                className="text-gray-500 hover:text-blue-400 hover:bg-gray-700 p-1 rounded"
                                                title="Edit"
                                            >
                                                {/* Pencil Icon */}
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                    />
                                                </svg>
                                            </button>

                                            {/* DELETE BUTTON */}
                                            <button
                                                type="button"
                                                onClick={() => removePassive(i)}
                                                className="text-gray-500 hover:text-red-500 hover:bg-gray-700 p-1 rounded"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {passives.length === 0 && (
                                    <p className="text-xs text-gray-600 italic">
                                        No passives added yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* --- Active Name and Cooldown --- */}
                            <div>
                                <div className="flex justify-between">
                                    <label className="text-xs text-gray-500 font-bold ml-1">
                                        Name
                                    </label>
                                    <label className="text-xs text-gray-500 font-bold mr-1">
                                        Cooldown
                                    </label>
                                </div>
                                <div className="flex gap-x-2">
                                    <input
                                        placeholder="Active Name"
                                        className="flex-1 bg-gray-800 text-white p-2 rounded text-sm border border-gray-700 focus:border-yellow-500 outline-none"
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
                                        className="w-20 bg-gray-800 text-white p-2 rounded text-sm border border-gray-700 focus:border-yellow-500 outline-none"
                                        value={tempActive.cd}
                                        onChange={(e) =>
                                            setTempActive({
                                                ...tempActive,
                                                cd: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            {/* --- Active Image Upload --- */}
                            <div>
                                <label className="text-xs text-gray-500 font-bold ml-1">
                                    Image Upload
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                    onChange={(e) =>
                                        e.target.files &&
                                        setTempActive({
                                            ...tempActive,
                                            file: e.target.files[0],
                                        })
                                    }
                                />
                            </div>
                            {/* --- Active Description --- */}
                            <div>
                                <label className="text-xs text-gray-500 font-bold ml-1">
                                    Description
                                </label>
                                <RichInput
                                    value={tempActive.desc}
                                    onChange={(val) =>
                                        setTempActive({
                                            ...tempActive,
                                            desc: val,
                                        })
                                    }
                                    placeholder="Description"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleActiveSubmit}
                                    className={`flex-1 py-2 rounded font-bold transition-colors ${
                                        editingActiveIndex !== null
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-blue-600/20 text-blue-400 border border-blue-600/50'
                                    }`}
                                >
                                    {editingActiveIndex !== null
                                        ? 'Update Active'
                                        : '+ Add Active'}
                                </button>
                                {editingActiveIndex !== null && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingActiveIndex(null);
                                            setTempActive({
                                                name: '',
                                                desc: '',
                                                cd: '0',
                                                file: null,
                                            });
                                        }}
                                        className="px-4 py-2 bg-gray-700 text-gray-300 rounded"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>

                            {/* --- LIST OF ADDED ACTIVES (With Delete Button) --- */}
                            <div className="mt-4 space-y-2">
                                {actives.map((a, i) => (
                                    <div
                                        key={i}
                                        className={`flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-700
                                            ${editingActiveIndex === i ? 'bg-blue-900/20 border-blue-500' : 'bg-gray-800 border-gray-700'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Tiny Image Preview */}
                                            <img
                                                src={a.iconUrl}
                                                alt="icon"
                                                className="w-8 h-8 rounded object-cover bg-gray-900"
                                            />
                                            <div className="text-sm">
                                                <span className="font-bold text-blue-400 block">
                                                    <RichTextParser
                                                        text={a.name}
                                                    />
                                                </span>
                                                <span className="text-[10px] text-gray-500 uppercase">
                                                    CD: {a.cooldown}s
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-1">
                                            <button
                                                onClick={() =>
                                                    startEditingActive(i)
                                                }
                                                className="text-gray-500 hover:text-blue-400 p-1"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => removeActive(i)}
                                                className="text-gray-500 hover:text-red-500 p-1"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {actives.length === 0 && (
                                    <p className="text-xs text-gray-600 italic">
                                        No active abilities added yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Update your Submit Button Text */}
                <button
                    type="submit"
                    disabled={isUploading}
                    className={`
                    w-full font-bold py-3 rounded transition-colors mt-6
                    ${
                        unitToEdit
                            ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                            : 'bg-green-600 hover:bg-green-500 text-white'
                    }
                `}
                >
                    {isUploading
                        ? 'Saving...'
                        : unitToEdit
                          ? 'Update Unit'
                          : 'Create Unit'}
                </button>
            </form>

            {/* --- Live Preview --- */}
            <div className="hidden lg:block sticky top-6 h-fit">
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
                    <p className="text-gray-500 text-xs mt-20 max-w-62.5">
                        * Preview mode: Card is locked 'Open'.
                    </p>
                </div>
            </div>
        </div>
    );
};
