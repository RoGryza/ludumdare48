import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { ItemType } from '../data/items';
import { PersonTag } from '../data/people';
import { Resources, Textures, variables } from '../states/index';

export class Person extends PIXI.Sprite {
    public readonly hand: PIXI.Sprite;
    public tags: Set<PersonTag>;
    private _item?: ItemType = null;

    public constructor(
        public resources: Resources,
        texture: Textures,
        public readonly emptyHand?: Textures,
    ) {
        super(resources[texture].texture);
        this.anchor.set(0.5);

        this.tags = new Set();

        this.hand = new Sprite();
        this.hand.anchor.set(0.5, 0.5);
        this.addChild(this.hand);
        this.item = null;

        this.direction = 3 * Math.PI / 2;
    }

    public lookAt(x: number, y: number) {
        this.direction = Math.atan2(y - this.y, x - this.x);
    }

    public get direction(): number {
        return this.hand.rotation;
    }

    public get item(): ItemType | null {
        return this._item;
    }

    public set item(item: ItemType) {
        this._item = item;
        if (item) {
            this.hand.texture = this.resources[item.texture].texture;
            this.hand.visible = true;
        } else if (this.emptyHand) {
            this.hand.texture = this.resources[this.emptyHand].texture;
            this.hand.visible = true;
        } else {
            this.hand.visible = false;
        }
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