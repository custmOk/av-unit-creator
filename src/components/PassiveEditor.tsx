import React, { useState } from 'react';
import type { PassiveAbility } from '../types';
import { RichInput } from './RichInput';
import { RichTextParser } from './RichTextParser';

interface Props {
    passives: PassiveAbility[];
    setPassives: (passives: PassiveAbility[]) => void;
}

export const PassiveEditor: React.FC<Props> = ({ passives, setPassives }) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [tempPassive, setTempPassive] = useState<{
        name: string;
        description: string;
    }>({
        name: '',
        description: '',
    });

    const startEditing = (index: number) => {
        const p = passives[index];
        setTempPassive({
            name: p.name,
            description: p.description.join('\n'),
        });
        setEditingIndex(index);
    };

    const handleSubmit = () => {
        if (!tempPassive.name || !tempPassive.description) return;

        const descArray = tempPassive.description
            .split('\n')
            .filter((l) => l.trim() !== '');
        const newPassiveObj = {
            name: tempPassive.name,
            description: descArray,
        };

        if (editingIndex !== null) {
            const updatedList = [...passives];
            updatedList[editingIndex] = newPassiveObj;
            setPassives(updatedList);
            setEditingIndex(null);
        } else {
            setPassives([...passives, newPassiveObj]);
        }

        setTempPassive({ name: '', description: '' });
    };

    const handleRemove = (index: number) => {
        setPassives(passives.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            {/* INPUTS */}
            <div className="space-y-3">
                <div>
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
                </div>
                <div>
                    <label className="text-xs text-gray-500 font-bold ml-1">
                        Description
                    </label>
                    <RichInput
                        value={tempPassive.description}
                        onChange={(val) =>
                            setTempPassive({ ...tempPassive, description: val })
                        }
                        placeholder="Description..."
                    />
                </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleSubmit}
                    className={`flex-1 py-2 rounded font-bold transition-colors text-sm ${
                        editingIndex !== null
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/50 hover:bg-yellow-600/40'
                    }`}
                >
                    {editingIndex !== null ? 'Update Passive' : '+ Add Passive'}
                </button>
                {editingIndex !== null && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingIndex(null);
                            setTempPassive({ name: '', description: '' });
                        }}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* LIST */}
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {passives.map((p, i) => (
                    <div
                        key={i}
                        className={`flex justify-between items-start bg-gray-800 p-3 rounded border ${
                            editingIndex === i
                                ? 'bg-blue-900/20 border-blue-500'
                                : 'border-gray-700'
                        }`}
                    >
                        <div className="text-sm flex-1 mr-2">
                            <span className="font-bold text-yellow-500 block mb-1">
                                <RichTextParser text={p.name} />
                            </span>
                            <p className="text-xs text-gray-400 line-clamp-1">
                                {p.description[0]}
                            </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                            <button
                                type="button"
                                onClick={() => startEditing(i)}
                                className="text-gray-500 hover:text-blue-400 hover:bg-gray-700 p-1 rounded"
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
                            <button
                                type="button"
                                onClick={() => handleRemove(i)}
                                className="text-gray-500 hover:text-red-500 hover:bg-gray-700 p-1 rounded"
                            >
                                {/* Trash Icon */}
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
    );
};
