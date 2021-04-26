import { Textures } from "../states";

export interface ItemType {
    texture: Textures,
    tags: Set<ItemTag>,
}

export enum ItemTag {
}

const ITEMS: Record<string, ItemType> = {
}

export default ITEMS;