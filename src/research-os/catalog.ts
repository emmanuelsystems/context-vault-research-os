import fs from 'fs';
import path from 'path';

// --- Interfaces ---

export interface Engine {
    id: string;
    name: string;
    family: 'learn' | 'choose' | 'verify' | 'compare';
    description: string;
    typical_inputs: string[];
    typical_outputs: string[];
    default_containers: string[];
}

export interface ContainerSlot {
    id: string;
    label: string;
    description: string;
    min_items?: number;
    accepts_sources?: boolean;
}

export interface Container {
    id: string;
    name: string;
    description: string;
    slots: ContainerSlot[];
    acceptance_criteria?: string;
}

export interface Subagent {
    id: string;
    name: string;
    role: string;
    description: string;
    engines: string[];
    skills: string[];
    safety_tier: string;
}

// --- Paths ---
const KNOWLEDGE_BASE_PATH = path.resolve(__dirname, '../../knowledge');

// --- Loaders ---
function loadCatalog<T>(subDir: string, fileName: string): T[] {
    const filePath = path.join(KNOWLEDGE_BASE_PATH, subDir, fileName);
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data) as T[];
    } catch (e) {
        console.error(`Failed to load catalog from ${filePath}`, e);
        return [];
    }
}

let _engines: Engine[] | null = null;
let _containers: Container[] | null = null;
let _subagents: Subagent[] | null = null;

export const Catalog = {
    getEngines: (): Engine[] => {
        if (!_engines) _engines = loadCatalog<Engine>('engines', 'engines.catalog.json');
        return _engines;
    },

    getContainers: (): Container[] => {
        if (!_containers) _containers = loadCatalog<Container>('containers', 'containers.catalog.json');
        return _containers;
    },

    getSubagents: (): Subagent[] => {
        if (!_subagents) _subagents = loadCatalog<Subagent>('subagents', 'subagents.catalog.json');
        return _subagents;
    },

    // --- Queries ---

    getEngineById: (id: string): Engine | undefined => {
        return Catalog.getEngines().find(e => e.id === id);
    },

    getContainerById: (id: string): Container | undefined => {
        return Catalog.getContainers().find(c => c.id === id);
    },

    getSubagentById: (id: string): Subagent | undefined => {
        return Catalog.getSubagents().find(s => s.id === id);
    },

    getEnginesByFamily: (family: Engine['family']): Engine[] => {
        return Catalog.getEngines().filter(e => e.family === family);
    },

    getSubagentsForEngine: (engineId: string): Subagent[] => {
        return Catalog.getSubagents().filter(s =>
            s.engines.includes(engineId) || s.engines.includes('*')
        );
    }
};
