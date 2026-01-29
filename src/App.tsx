import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { Auth } from './components/Auth';
import { UnitCreator } from './components/UnitCreator';
import { UnitGallery } from './components/UnitGallery';
import type { Unit } from './types';

function App() {
    const [session, setSession] = useState<any>(null);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

    const creatorSectionRef = useRef<HTMLDivElement>(null);

    // AUTH LISTENER
    useEffect(() => {
        supabase.auth
            .getSession()
            .then(({ data: { session } }) => setSession(session));
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleEditUnit = (unit: Unit) => {
        setEditingUnit(unit);

        setTimeout(() => {
            creatorSectionRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
            {/* HEADER with Sign Out */}
            <header className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold">Unit Database</h1>
                {session && (
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="bg-gray-800 px-3 py-1 rounded"
                    >
                        Sign Out
                    </button>
                )}
            </header>

            {/* GALLERY (Pass Edit Handler) */}
            <UnitGallery
                session={session}
                onEdit={(unit) => setEditingUnit(unit)} // <--- Capture unit to edit
            />

            <div className="border-t border-gray-800 my-10"></div>

            {/* CREATOR OR LOGIN */}
            <div ref={creatorSectionRef} className="scroll-mt-10">
                {session ? (
                    <UnitCreator
                        session={session}
                        unitToEdit={editingUnit} // <--- Pass it to creator
                        onCancelEdit={() => setEditingUnit(null)} // <--- Clear it on cancel
                    />
                ) : (
                    <Auth />
                )}
            </div>
        </div>
    );
}

export default App;
