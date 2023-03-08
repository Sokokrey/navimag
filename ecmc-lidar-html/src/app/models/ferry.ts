import { Ferry_Deck } from './ferry_deck'

export interface Ferry {
    name?: string;
    color?: string;
    max_height?: Number;
    ferry_decks?: Array<Ferry_Deck>;
    decks?: Array<String>;
 }