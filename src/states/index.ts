import * as PIXI from 'pixi.js';
import { RangeVariable, Variables } from '../development';

export interface GameState {
    afterEnter(): void;
    beforeExit(): void;
    update(delta: number): GameState;
}

export const variables: Variables = {
    playerSpeed: new RangeVariable(200),
    handOffset: new RangeVariable(32),

    stageWidth: new RangeVariable(2000.0),
    stageHeight: new RangeVariable(2000.0),

    civilianSpeed: new RangeVariable(1),
    civilianWanderMinMS: new RangeVariable(2000.0),
    civilianWanderMaxMS: new RangeVariable(8000.0),
    civilianWanderMinDist: new RangeVariable(50.0),
    civilianWanderMaxDist: new RangeVariable(500.0),
};

export enum Textures {
    player = "player",
    crosshair = "crosshair",
    fingergun = "fingergun",
    citizen = "citizen",
    farmer = "farmer",
    money = "money",
    torch = "torch",
    forest = "forest",
    gun = "gun",
};

export type Resources = {
    [K in Textures]: { texture: PIXI.Texture }
};