import { UnitGallery } from './components/UnitGallery';
import { UnitCreator } from './components/UnitCreator';

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
