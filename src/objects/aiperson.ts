import { AiAction, handleAction } from "../ai/action";
import { Behaviour } from "../ai/behaviour";
import { Resources, Textures } from "../states";
import { Person } from "./person";

export class AiPerson extends Person {
    public actions: AiAction[];
    private _behaviour?: Behaviour = null;
    private _index: number;
    public static readonly ALIVE: AiPerson[] = [];

    public constructor(
        resources: Resources,
        texture: Textures,
        emptyHand: Textures | null,
        public speed: number,
    ) {
        super(resources, texture, emptyHand);
        this.actions = [];
        this.on('added', () => {
            this._index = AiPerson.ALIVE.length;
            AiPerson.ALIVE.push(this);
        });
        this.on('removed', () => {
            const ALIVE = AiPerson.ALIVE;
            ALIVE[this._index] = ALIVE[ALIVE.length - 1];
            ALIVE[this._index]._index = this._index;
            ALIVE.pop();
        });
    }

    public set behaviour(value: Behaviour) {
        if (this._behaviour) {
            this._behaviour.beforeExit();
        }
        this._behaviour = value;
        this.actions = [];
        this._behaviour.afterEnter();
    }

    public update(delta: number): void {
        if (this._behaviour) {
            const nextBehaviour = this._behaviour.update(delta);
            if (nextBehaviour !== this._behaviour) {
                this.behaviour = nextBehaviour;
            }
        }

        if (this.actions.length === 0) {
            return;
        }

        if (handleAction(this, delta, this.actions[0])) {
            this.actions.shift();
        }
    }
}