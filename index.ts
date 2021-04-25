import * as PIXI from 'pixi.js';
import { GraphicsGeometry, settings } from 'pixi.js';
import { inputState, clearInput } from './src/input';

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const variables = {
    playerSpeed: 200,
    gunOffset: 32,
};

((global) => {
    const WIDTH = 416;
    const HEIGHT = 312;
    const view = document.getElementById('pixi-canvas') as HTMLCanvasElement;

    const app = new PIXI.Application({
        width: WIDTH * 2,
        height: HEIGHT * 2,
        view,
        backgroundColor: 0x443355,
    });
    app.stage.scale.set(2.0);

    const loadingText = new PIXI.Text(
        "Loading...",
        { fontSize: 75, fill: 0xff1010 },
    );
    loadingText.anchor.set(0.5);
    loadingText.position.set(WIDTH / 2, HEIGHT / 2);
    app.stage.addChild(loadingText);

    let player: PIXI.Sprite;
    let gun: PIXI.Sprite;
    let crosshair: PIXI.Sprite;

    let lastTime = 0.0;
    function runLoop(delta: number) {
        const { up, down, left, right, fire } = inputState.buttons;
        let dx = 0;
        let dy = 0;
        const deltaPx = variables.playerSpeed * delta / 1000.0;
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
        player.position.set(
            player.position.x + dx * deltaPx,
            player.position.y + dy * deltaPx,
        );

        const cursor = inputState.cursor.position;
        crosshair.position.set(cursor.x, cursor.y);

        const gun_angle = Math.atan2(
            cursor.y - player.position.y,
            cursor.x - player.position.x,
        );
        const gun_sprite_angle = gun_angle + Math.PI / 2;
        gun.rotation = gun_sprite_angle;
        gun.position.set(
            variables.gunOffset * Math.cos(gun_angle),
            variables.gunOffset * Math.sin(gun_angle),
        );

        clearInput();
    }

    app.loader
        .add('player', 'assets/textures/player.png')
        .add('crosshair', 'assets/textures/crosshair.png')
        .add('fingergun', 'assets/textures/fingergun.png');
    app.loader.load((_, resources) => {
        app.stage.removeChildren();

        player = new PIXI.Sprite(resources.player.texture);
        player.anchor.set(0.5);
        player.position.set(WIDTH / 2, HEIGHT / 2);

        gun = new PIXI.Sprite(resources.fingergun.texture);
        gun.anchor.set(0.5, 0.5);
        gun.position.set(0, -48);
        player.addChild(gun);

        app.stage.addChild(player);

        crosshair = new PIXI.Sprite(resources.crosshair.texture);
        crosshair.anchor.set(0.5, 0.5);
        app.stage.addChild(crosshair);

        function renderLoop(currentTime: number) {
            const delta = currentTime - lastTime;
            lastTime = currentTime;
            runLoop(delta);
            requestAnimationFrame(renderLoop);
        }
        renderLoop(0.0);
    });
})(document);