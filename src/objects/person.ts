import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { DevelopmentPanel } from '../development';
import { inputState } from '../input';
import { Resources, Textures, variables } from '../states/index';

export class Person extends PIXI.Sprite {
    public readonly hand: PIXI.Sprite;

    public constructor(resources: Resources, texture: Textures) {
        super(resources[texture].texture);
        this.anchor.set(0.5);

        this.hand = new Sprite(resources.fingergun.texture);
        this.hand.anchor.set(0.5, 0.5);
        this.addChild(this.hand);
    }

    public lookAt(x: number, y: number) {
        this.direction = Math.atan2(y - this.y, x - this.x);
    }

    public get direction(): number {
        return this.hand.rotation;
    }

    public set direction(value: number) {
        if (value === this.hand.rotation) return;
        this.hand.rotation = value;
        this.hand.position.set(
            variables.handOffset.value * Math.cos(value),
            variables.handOffset.value * Math.sin(value),
        );
        const flipv = (value <= -0.5 * Math.PI || value >= 0.5 * Math.PI);
        this.hand.scale.y = flipv ? -1.0 : 1.0;
    }
}