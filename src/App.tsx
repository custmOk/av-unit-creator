import type { Unit } from './types';
import { UnitGallery } from './components/UnitGallery';
import { UnitCreator } from './components/UnitCreator';

// --- MOCK DATA ---
const UNITS: Unit[] = [
    {
        id: '1',
        name: 'Shadow Stalker',
        rarity: 'Legendary',
        imageUrl:
            'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=600&auto=format&fit=crop', // Placeholder darker image
        passives: [
            {
                name: 'Nightshade',
                description: [
                    'Invisible to enemies when standing still for 3 seconds.',
                    'First attack breaking invisibility deals critical damage.', // <--- New Bullet point
                ],
            },
            {
                name: 'Backstab',
                description: [
                    'Deals 200% damage when attacking from behind.',
                    'Ignores 15% of enemy armor.',
                ],
            },
        ],
        actives: [
            {
                name: 'Smoke Bomb',
                description:
                    'Throws a smoke bomb blinding enemies in range for 5s.',
                cooldown: 12,
                iconUrl:
                    'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=200&auto=format&fit=crop', // Smoke image
            },
            {
                name: 'Shadow Step',
                description: 'Teleport behind the furthest enemy unit.',
                cooldown: 8,
                iconUrl:
                    'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=200&auto=format&fit=crop', // Purple abstract
            },
        ],
    },
    {
        id: '2',
        name: 'Isagi (Heart of Blue Lock)',
        rarity: 'Exclusive',
        imageUrl: 'https://wallpaperaccess.com/full/8888390.png',
        passives: [
            {
                name: 'Genius of Adaptation',
                description: [
                    'When afflicted with a status ailment 5 times in a row, become immune until hit with a different status ailment',
                ],
            },
            {
                name: 'Talented Learner',
                description: [
                    '+1% damage for every enemy takedown in range up to +30% damage',
                    "When units aren't taken down in range for 10 seconds, resets back to 0%",
                ],
            },
            {
                name: 'Devourer',
                description: [
                    'When unit in range is debuffed, cleanses unit and turns into a positive buff (up to one unit in range)',
                ],
            },
        ],
        actives: [
            {
                name: 'Metavision',
                description:
                    '+20% crit chance for 15 seconds and deals +100% damage to the highest health enemy range',
                cooldown: 80,
                iconUrl:
                    'https://pbs.twimg.com/media/FtjCL4JWwAMuZQL?format=jpg&name=small',
            },
        ],
    },
    {
        id: '3',
        name: "Kaiser (God's Chosen Emperor)",
        rarity: 'Exclusive',
        imageUrl: 'https://wallpaperaccess.com/full/9000142.jpg',
        passives: [
            {
                name: 'Off-the-Ball Movements',
                description: [
                    'When attacking an enemy with status effects applied, deal 20% more damage',
                ],
            },
            {
                name: 'German Prodigy',
                description: [
                    'When debuffed, debuff is redirected to a burn random unit in range',
                    'If no units are available, unit is debuffed for 75% uptime',
                ],
            },
            {
                name: 'Blue Rose',
                description: [
                    'When attacking an enemy with more than 1000% of units damage as health, deal 100% more damage',
                ],
            },
        ],
        actives: [
            {
                name: 'Predator Eye',
                description:
                    'deals +350% damage to the highest health enemy range and gains 5% range up to 50%',
                cooldown: 40,
                iconUrl:
                    'https://i.pinimg.com/736x/d0/0e/0f/d00e0fb5bef227ade5e7662ed91862df.jpg',
            },
        ],
    },
];

function App() {
    return (
        <div className="min-h-screen bg-gray-950 p-8 font-sans text-gray-100">
            {/* Header */}
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold text-white">Unit Roster</h1>
            </header>

            {/* SECTION 1: The Gallery */}
            <section className="mb-16">
                <UnitGallery />
            </section>

            {/* SECTION 2: The Creator Form */}
            <section>
                <h2 className="text-2xl font-bold border-l-4 border-green-500 pl-4 mb-8">
                    Create New Unit
                </h2>
                <UnitCreator />
            </section>
        </div>
    );
}

export default App;
