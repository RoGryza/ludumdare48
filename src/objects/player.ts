import * as PIXI from 'pixi.js';
import { DevelopmentPanel } from '../development';
import { inputState } from '../input';
import { Resources, Textures, variables } from '../states/index';
import { Person } from './person';

export class Player extends Person {
    public constructor(resources: Resources) {
        super(resources, Textures.player);
    }

    public update(app: PIXI.Application, bounds: PIXI.Rectangle, cx: number, cy: number, delta: number) {
        const { up, down, left, right, fire } = inputState.buttons;
        let dx = 0;
        let dy = 0;
        const deltaPx = variables.playerSpeed.value * delta / 1000.0;
        if (up.down) {
            dy = -1.0;
        } else if (down.down) {
            dy = 1.0;
        }
        if (right.down) {
            dx = 1.0;
        } else if (left.down) {
            dx = -1.0;
        }

        // Normalize speed
        if (dx != 0.0 && dy != 0.0) {
            dx *= 1.4142;
            dy *= 1.4142;
        }
        let x = this.position.x + dx * deltaPx;
        let y = this.position.y + dy * deltaPx;
        if (x < bounds.left) x = bounds.left;
        if (x > bounds.right) x = bounds.right;
        if (y < bounds.top) y = bounds.top;
        if (y > bounds.bottom) y = bounds.bottom;
        this.position.set(x, y);

        this.lookAt(this.x + cx, this.y + cy);
    }
}