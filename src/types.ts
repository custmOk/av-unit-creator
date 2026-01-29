export type Rarity = 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Exclusive' | 'Secret' | 'Vanguard';

export interface PassiveAbility {
    name: string;
    description: string[];
}

export interface ActiveAbility {
    name: string;
    description: string[];
    cooldown: number;
    iconUrl: string;
}

export interface Unit {
    id?: string;
    name: string;
    rarity: Rarity;
    category: string;
    imageUrl: string;
    passives: PassiveAbility[];
    actives: ActiveAbility[];
    userId: string;
}