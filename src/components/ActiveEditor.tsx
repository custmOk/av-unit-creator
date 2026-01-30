import React, { useState } from 'react';
import type { ActiveAbility } from '../types';
import { RichInput } from './RichInput';
import { RichTextParser } from './RichTextParser';

interface ActiveWithFile extends ActiveAbility {
    file?: File | null;
}

interface Props {
    actives: ActiveWithFile[];
    setActives: (actives: ActiveWithFile[]) => void;
}

export const ActiveEditor: React.FC<Props> = ({ actives, setActives }) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
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

    const startEditing = (index: number) => {
        const a = actives[index];
        setTempActive({
            name: a.name,
            desc: a.description.join('\n'),
            cd: a.cooldown.toString(),
            file: null,
        });
        setEditingIndex(index);
    };

    const handleSubmit = () => {
        if (!tempActive.name || !tempActive.desc) return;

        let iconUrlToUse = '';
        if (tempActive.file) {
            iconUrlToUse = URL.createObjectURL(tempActive.file);
        } else if (editingIndex !== null) {
            iconUrlToUse = actives[editingIndex].iconUrl;
        } else {
            return alert('Please upload an icon');
        }

        const descArray = tempActive.desc.split('\n').filter((l) => l.trim() !== '');

        const newActiveObj = {
            name: tempActive.name,
            description: descArray,
            cooldown: parseInt(tempActive.cd) || 0,
            iconUrl: iconUrlToUse,
            file: tempActive.file,
        };

        if (editingIndex !== null) {
            const updatedList = [...actives];
            updatedList[editingIndex] = newActiveObj;
            setActives(updatedList);
            setEditingIndex(null);
        } else {
            setActives([...actives, newActiveObj]);
        }

        setTempActive({ name: '', desc: '', cd: '0', file: null });
    };

    const handleRemove = (index: number) => {
        const activeToRemove = actives[index];
        if (activeToRemove.iconUrl && activeToRemove.file) {
            URL.revokeObjectURL(activeToRemove.iconUrl);
        }
        setActives(actives.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            {/* INPUTS ROW 1 */}
            <div className="flex gap-3">
                <div className="flex-1">
                    <label className="text-xs text-gray-500 font-bold ml-1">Name</label>
                    <input
                        placeholder="Active Name"
                        className="w-full bg-gray-800 text-white p-2 rounded text-sm border border-gray-700 focus:border-yellow-500 outline-none"
                        value={tempActive.name}
                        onChange={(e) => setTempActive({ ...tempActive, name: e.target.value })}
                    />
                </div>
                <div className="w-24">
                    <label className="text-xs text-gray-500 font-bold ml-1">CD (s)</label>
                    <input
                        type="number"
                        className="w-full bg-gray-800 text-white p-2 rounded text-sm border border-gray-700 focus:border-yellow-500 outline-none"
                        value={tempActive.cd}
                        onChange={(e) => setTempActive({ ...tempActive, cd: e.target.value })}
                    />
                </div>
            </div>

            {/* IMAGE INPUT */}
            <div>
                <label className="text-xs text-gray-500 font-bold ml-1">Icon Upload</label>
                <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer bg-gray-800 rounded"
                    onChange={(e) => e.target.files && setTempActive({ ...tempActive, file: e.target.files[0] })}
                />
            </div>

            {/* DESCRIPTION */}
            <div>
                <label className="text-xs text-gray-500 font-bold ml-1">Description</label>
                <RichInput
                    value={tempActive.desc}
                    onChange={(val) => setTempActive({ ...tempActive, desc: val })}
                    placeholder="Description..."
                />
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleSubmit}
                    className={`flex-1 py-2 rounded font-bold transition-colors text-sm ${
                        editingIndex !== null
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-600/20 text-blue-400 border border-blue-600/50 hover:bg-blue-600/40'
                    }`}
                >
                    {editingIndex !== null ? 'Update Active' : '+ Add Active'}
                </button>
                {editingIndex !== null && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingIndex(null);
                            setTempActive({ name: '', desc: '', cd: '0', file: null });
                        }}
                        className="px-4 py-2 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* LIST */}
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {actives.map((a, i) => (
                    <div
                        key={i}
                        className={`flex justify-between items-center bg-gray-800 p-2 rounded border ${
                            editingIndex === i ? 'bg-blue-900/20 border-blue-500' : 'border-gray-700'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <img src={a.iconUrl} alt="icon" className="w-8 h-8 rounded object-cover bg-gray-900" />
                            <div className="text-sm">
                                <span className="font-bold text-blue-400 block"><RichTextParser text={a.name} /></span>
                                <span className="text-[10px] text-gray-500 uppercase">CD: {a.cooldown}s</span>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => startEditing(i)}
                                className="text-gray-500 hover:text-blue-400 p-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                                </svg>
                            </button>
                            <button
                                onClick={() => handleRemove(i)}
                                className="text-gray-500 hover:text-red-500 p-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
                {actives.length === 0 && <p className="text-xs text-gray-600 italic">No active abilities added yet.</p>}
            </div>
        </div>
    );
};