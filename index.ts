import * as PIXI from 'pixi.js';
import { clearInput, setupInput } from './src/input';
import { DevelopmentPanel } from './src/development';
import { GameState, variables } from './src/states';
import { LoadingState } from './src/states/loadig';
import consts from './src//consts';

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

((document) => {
    DevelopmentPanel.init(variables, document.getElementById("container"));
    const view = document.getElementById('pixi-canvas') as HTMLCanvasElement;

    const app = new PIXI.Application({
        width: consts.WIDTH,
        height: consts.HEIGHT,
        view,
        backgroundColor: 0x443355,
    });
    setupInput(window, app);

    const RATIO = consts.WIDTH / consts.HEIGHT;
    function onResize() {
        let w: number, h: number;
        if (window.innerWidth / window.innerHeight >= RATIO) {
            w = window.innerHeight * RATIO;
            h = window.innerHeight - 50.0;
        } else {
            w = window.innerWidth - 50.0;
            h = window.innerWidth / RATIO;
        }
        if (w < consts.WIDTH || h < consts.HEIGHT) {
            w = consts.WIDTH;
            h = consts.HEIGHT;
        }
        view.style.width = `${w}px`;
        view.style.height = `${h}px`;
    }
    window.addEventListener('resize', onResize);
    onResize();

    let state: GameState = new LoadingState(app);
    state.afterEnter();
    let lastTime = 0.0;
    function renderLoop(currentTime: number) {
        const delta = currentTime - lastTime;
        lastTime = currentTime;
        const nextState = state.update(delta);
        if (nextState !== state) {
            state.beforeExit();
            state = nextState;
            state.afterEnter();
        }
        clearInput();
        requestAnimationFrame(renderLoop);
    }
    renderLoop(0.0);
})(document);