import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { GameState, Resources, variables } from ".";
import { VariableChangeEvent } from '../development';
import { inputState } from '../input';
import { Player } from "../objects/player";

export class MainGameState implements GameState {
    public readonly camera: PIXI.Container;
    public readonly player: Player;
    public readonly crosshairSprite: PIXI.Sprite;
    public readonly bounds: PIXI.Graphics;
    private _onChangeStage: () => void;

    constructor(public readonly app: PIXI.Application, public readonly resources: Resources) {
        this.camera = new PIXI.Container();
        this.player = new Player(resources);
        this.camera.addChild(this.player);
        this.crosshairSprite = new PIXI.Sprite(resources.crosshair.texture);
        this.crosshairSprite.anchor.set(0.5, 0.5);

        this.bounds = new PIXI.Graphics();
        this._onChangeStage = () => {
            this.bounds.clear();
            this.bounds.beginFill(0x343434);
            this.bounds.drawRect(0.0, 0.0, variables.stageWidth.value, variables.stageHeight.value);
            this.bounds.endFill();
        };
        this.camera.addChildAt(this.bounds, 0);
        variables.stageWidth.addEventListener("change", this._onChangeStage);
        variables.stageHeight.addEventListener("change", this._onChangeStage);
    }

    afterEnter(): void {
        this.player.position.set(this.app.screen.width / 2.0, this.app.screen.height / 2.0);
        this.camera.position.set(this.app.screen.width / 2.0, this.app.screen.height / 2.0);
        this.camera.pivot.copyFrom(this.player.position);
        this._onChangeStage();

        this.crosshairSprite.position.set(this.player.position.x, this.player.position.y + variables.handOffset.value);

        this.app.stage.addChild(this.camera);
        this.app.stage.addChild(this.crosshairSprite);

        const { width, height } = this.app.renderer;
        const vscreens = Math.ceil(variables.stageHeight.value / height);
        const hscreens = Math.ceil(variables.stageWidth.value / width);
        for (let i = 0; i < vscreens; ++i) {
            for (let j = 0; j < hscreens; ++j) {
                const screenx = j * width;
                const screeny = i * height;
                const offset = 20.0;
                const forest = new PIXI.Sprite(this.resources.forest.texture);
                forest.position.set(screenx + offset, screeny + offset);
                this.camera.addChild(forest);
            }
        }
    }

    beforeExit(): void {
        variables.stageWidth.removeEventListener("change", this._onChangeStage);
        variables.stageHeight.removeEventListener("change", this._onChangeStage);
        this.app.stage.removeChildren();
        this.bounds.destroy({ children: true });
        this.camera.destroy({ children: true });
        this.crosshairSprite.destroy({ children: true });
    }

    update(delta: number): GameState {
        const bounds = new PIXI.Rectangle(0, 0, variables.stageWidth.value, variables.stageHeight.value);
        const { width, height } = this.app.renderer.screen;
        this.player.update(this.app, bounds, this.crosshairSprite.x - width / 2, this.crosshairSprite.y - height /2, delta);

        this.camera.pivot.copyFrom(this.player.position);

        const cursorDelta = inputState.cursor.delta;
        const crosshairPos = this.crosshairSprite.position;
        let crosshairX = crosshairPos.x + cursorDelta.x;
        if (crosshairX < 0.0) crosshairX = 0.0;
        if (crosshairX > this.app.renderer.screen.width) crosshairX = this.app.renderer.screen.width;
        let crosshairY = crosshairPos.y + cursorDelta.y;
        if (crosshairY < 0.0) crosshairY = 0.0;
        if (crosshairY > this.app.renderer.screen.height) crosshairY = this.app.renderer.screen.height;
        crosshairPos.set(crosshairX, crosshairY);

        return this;
    }
}