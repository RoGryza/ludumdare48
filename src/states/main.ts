import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';
import { GameState, Resources, Textures, variables } from ".";
import { WanderBehaviour } from '../ai/behaviour';
import { inputState } from '../input';
import { AiPerson } from '../objects/aiperson';
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
        variables.stageWidth.on("change", this._onChangeStage);
        variables.stageHeight.on("change", this._onChangeStage);
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

                const civilianOffset = height - 50.0;
                const civilian = new AiPerson(
                    this.resources,
                    Textures.citizen,
                    null,
                    variables.civilianSpeed.value,
                );
                civilian.behaviour = new WanderBehaviour(
                    civilian,
                    variables.civilianWanderMinMS.value,
                    variables.civilianWanderMaxMS.value,
                    variables.civilianWanderMinDist.value,
                    variables.civilianWanderMaxDist.value,
                );
                civilian.position.set(screenx + civilianOffset, screeny + civilianOffset);
                this.camera.addChild(civilian);
            }
        }
    }

    beforeExit(): void {
        variables.stageWidth.off("change", this._onChangeStage);
        variables.stageHeight.off("change", this._onChangeStage);
        const removed = this.app.stage.removeChildren();
        for (const child of removed) {
            child.destroy({ children: true });
        }
    }

    update(delta: number): GameState {
        for (const aiPerson of AiPerson.ALIVE) {
            aiPerson.update(delta);
        }

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