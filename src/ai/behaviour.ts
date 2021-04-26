import { Rectangle } from "pixi.js";
import { Variable } from "../development";
import { AiPerson } from "../objects/aiperson";
import { AiAction, AiActionType } from "./action";

export class Behaviour {
    public actions: AiAction[];
    public constructor(public me: AiPerson) {
        this.actions = [];
    }
    public afterEnter(): void { }
    public beforeExit(): void { }
    public update(delta: number): Behaviour { return this; }
}

export class WanderBehaviour extends Behaviour {
    private _toNextWalk: number = 0;

    public constructor(
        public me: AiPerson,
        public bounds: Variable<Rectangle>,
        public intervalMS: Variable<NumberRange>,
    ) {
        super(me);
    }

    override afterEnter(): void {
        super.afterEnter();
        const { min, max } = this.intervalMS.value;
        this._toNextWalk = randBetween(min, max);
    }

    override update(delta: number): Behaviour {
        super.update(delta);
        this._toNextWalk -= delta;
        if (this._toNextWalk <= 0.0) {
            this._toNextWalk += randBetween(this.minIntervalMS.value, this.maxIntervalMS.value);
            const direction = Math.random() * 2 * Math.PI;
            const distance = randBetween(this.minDistance.value, this.maxDistance.value);
            this.me.actions.push({
                type: AiActionType.walkTo,
                x: this.me.x + distance * Math.cos(direction),
                y: this.me.y + distance * Math.sin(direction),
            })
        }
        return this;
    }
};

function randBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}