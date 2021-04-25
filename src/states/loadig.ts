import * as PIXI from 'pixi.js';
import { GameState, Resources, Textures } from ".";
import { MainGameState } from './main';

export class LoadingState implements GameState {
    private _resources?: Resources = null;
    private _loadingText: PIXI.Text;

    public constructor(public app: PIXI.Application) {
        this._loadingText = new PIXI.Text(
            "Loading...",
            { fontSize: 75, fill: 0xff1010 },
        );
        this._loadingText.anchor.set(0.5);
        this._loadingText.position.set(
            app.renderer.width / 2.0,
            app.renderer.height / 2.0,
        );
    }

    public afterEnter(): void {
        // TODO handle errors
        Object.values(Textures).forEach(
            (name) => this.app.loader.add(name, `assets/textures/${name}.png`)
        );
        this.app.loader.load((_, r) => this._resources = r);
        this.app.stage.addChild(this._loadingText);
    }

    public beforeExit(): void {
        this.app.stage.removeChildren();
        this._loadingText.destroy();
    }

    public update(_delta: number): GameState {
        if (this._resources !== null) {
            return new MainGameState(this.app, this._resources);
        }
        return this;
    }
}