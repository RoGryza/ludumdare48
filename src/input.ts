export type Action = 'up' | 'down' | 'left' | 'right' | 'fire';

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
    cursor: { position: { x: number, y: number }},
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
    },
};

export function clearInput() {
    Object.values(inputState.buttons).forEach(btn => btn.justPressed = false);
}

function setupInput(global: Window): void {
    global.addEventListener('keydown', keydown);
    global.addEventListener('keyup', keyup);
    global.document.getElementById('pixi-canvas').addEventListener('mousemove', mousemove);
}
setupInput(window);

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
    const position = inputState.cursor.position;
    position.x = event.clientX - bounds.left;
    position.y = event.clientY - bounds.top;
}