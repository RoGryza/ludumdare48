import * as PIXI from 'pixi.js';
import { DevelopmentPanel } from './development';

export type Action = 'up' | 'down' | 'left' | 'right' | 'fire';
let _app: PIXI.Application;

const inputMapping: { buttons: Record<string, Action> } = {
    buttons: {
        w: 'up',
        a: 'left',
        s: 'down',
        d: 'right',
        rmb: 'fire',
    },
};

export interface KeyState {
    down: boolean,
    justPressed: boolean,
}

export const inputState: {
    buttons: Record<Action, KeyState>,
    cursor: {
        position: { x: number, y: number },
        delta: { x: number, y: number },
    },
} = {
    buttons: {
        up: { down: false, justPressed: false },
        down: { down: false, justPressed: false },
        left: { down: false, justPressed: false },
        right: { down: false, justPressed: false },
        fire: { down: false, justPressed: false },
    },

    cursor: {
        position: { x: 0, y: 0 },
        delta: { x: 0, y: 0 },
    },
};

export function clearInput() {
    Object.values(inputState.buttons).forEach(btn => btn.justPressed = false);
    inputState.cursor.delta.x = 0.0;
    inputState.cursor.delta.y = 0.0;
}

export function setupInput(global: Window, app: PIXI.Application): void {
    _app = app;
    global.addEventListener('keydown', keydown);
    global.addEventListener('keyup', keyup);
    global.document.getElementById('pixi-canvas').addEventListener('mousemove', mousemove);
}

function keydown(event: KeyboardEvent): void {
    const action = inputMapping.buttons[event.key];
    if (!action) {
        return;
    }
    const state = inputState.buttons[action];
    state.down = true;
    state.justPressed = true;
}

function keyup(event: KeyboardEvent): void {
    const action = inputMapping.buttons[event.key];
    if (!action) {
        return;
    }
    const state = inputState.buttons[action];
    state.down = false;
}

function mousemove(this: HTMLElement, event: MouseEvent): void {
    const bounds = this.getBoundingClientRect();
    const { position, delta } = inputState.cursor;

    const px = position.x;
    const py = position.y;

    const scaleX = _app.renderer.width / _app.renderer.screen.width;
    position.x = (event.clientX - bounds.left) / scaleX;
    const scaleY = _app.renderer.height / _app.renderer.screen.height;
    position.y = (event.clientY - bounds.top) / scaleY;
    delta.x += position.x - px;
    delta.y += position.y - py;
}