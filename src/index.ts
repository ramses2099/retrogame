// ===========================GLOBALS====================================
const SIZE_CANVAS = { WIDTH: 600, HEIGHT: 650 } as const;

//============================HELPER FUNCTION============================
class Log {
    static log<T>(msg: T): void {
        console.log(`[DEV] ${msg}`);
    }
    //
    static logarray<T>(arr: Array<T>): void {
        for (let i = 0; i < arr.length; i++) {
            const el = arr.at(i) as T;
            console.log(`[DEV] ${JSON.stringify(el)}`);
        }
    }
}

/**
 * Represents a rectangle.
 * 
 * @remarks
 * This class handler the properties of the rectangle
 */
class Rect {
    x: number
    y: number
    w: number
    h: number

    /**
   * Creates an instance of Rect.
   * 
   * @param x - The position of x coordinate.
   * @param y - The position of y coordinate.
   * @param w - The width of the rectangle.
   * @param h - The height of the rectangle.
   */
    constructor(x: number, y: number, w: number = 64, h: number = 64,) {
        this.w = w;
        this.h = h;
        this.x = x;
        this.y = y;
    }
}


class Player {
    rect: Rect
    speed: number

    constructor() {
        this.rect = new Rect(0, 0);
        this.rect.x = SIZE_CANVAS.WIDTH * 0.5 - this.rect.w * 0.5;
        this.rect.y = SIZE_CANVAS.HEIGHT - this.rect.h;
        this.speed = 100;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // 1. Set the visual styles
        ctx.fillStyle = "#3498db";    // Interior color
        ctx.strokeStyle = "#2c3e50";  // Border color
        ctx.lineWidth = 5;            // Border thickness

        // 2. Draw the interior fill
        ctx.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);

        // 3. Draw the border outline
        ctx.strokeRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
    }

    update(delataTime: number, keys: Array<string>): void {
        // HORIZONTAL MOVEMENT
        if (keys.indexOf('ArrowLeft') > -1) {
            this.rect.x -= this.speed * delataTime;
        }
        if (keys.indexOf('ArrowRight') > -1) {
            this.rect.x += this.speed * delataTime;
        }
        // HORIZONTAL BOUNDARIES
        if (this.rect.x < 0) {
            this.rect.x = 0;
        } else if (this.rect.x > SIZE_CANVAS.WIDTH - this.rect.w) {
            this.rect.x = SIZE_CANVAS.WIDTH - this.rect.w;
        }
    }

}

class Projectile {
    rect: Rect;
    speed: number;
    free: boolean;

    constructor() {
        this.rect = new Rect(0, 0);
        this.rect.w = 4;
        this.rect.h = 20;
        this.speed = 200;
        this.free = true
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.free) {
            // 1. Set the visual styles
            ctx.fillStyle = "#3498db";    // Interior color
            ctx.strokeStyle = "#2c3e50";  // Border color
            ctx.lineWidth = 5;            // Border thickness

            // 2. Draw the interior fill
            ctx.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);

            // 3. Draw the border outline
            ctx.strokeRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
        }
    }

    update(delataTime: number): void {
        if (!this.free) {
            this.rect.y -= this.speed * delataTime;
        }
    }

    start(): void { this.free = true; }
    reset(): void { this.free = true; }

}

class Enemy {

}

class Game {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    isRunning: boolean
    lastTime: number
    keys: Array<string>
    projectilesPool: Array<Projectile>
    numberOfProjectiles: number
    player: Player

    constructor() {
        this.canvas = document.getElementById('canvas1') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
        this.canvas.width = SIZE_CANVAS.WIDTH;
        this.canvas.height = SIZE_CANVAS.HEIGHT;

        // setting
        this.isRunning = false;
        this.lastTime = 0;
        this.keys = new Array<string>()
        this.player = new Player()
        this.projectilesPool = new Array<Projectile>()
        this.numberOfProjectiles = 10
        this.createProjectiles()

        

        this.initInput();
        this.loop = this.loop.bind(this);
    }

    createProjectiles() {
        for (let i = 0; i < this.numberOfProjectiles; i++) {
            this.projectilesPool.push(new Projectile());
        }
    }

    getProjectile(): Projectile | undefined {
        for (let i = 0; i < this.projectilesPool.length; i++) {
            const projectile = this.projectilesPool.at(i) as Projectile;
            if (projectile.free) {
                return this.projectilesPool[i];
            }
        }
        return undefined;
    }

    start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now()

        requestAnimationFrame(this.loop)
        console.log('[DEV] Game starte sucessfully')
    }

    initInput() {
        window.addEventListener('keydown', (e) => {
            if (this.keys.indexOf(e.key) === -1) this.keys.push(e.key);
        })
        //
        window.addEventListener('keyup', (e) => {
            const index = this.keys.indexOf(e.key);
            if (index > -1) {
                this.keys.splice(index, 1);
            }
        })
    }

    update(deltaTime: number): void {

        //UPDATE
        this.player.update(deltaTime, this.keys);

        // RENDER
        if (this.ctx != null) {
            this.ctx.clearRect(0, 0, SIZE_CANVAS.WIDTH, SIZE_CANVAS.HEIGHT)

            // Draw background
            this.ctx.fillStyle = '#1a1a2e'
            this.ctx.fillRect(0, 0, SIZE_CANVAS.WIDTH, SIZE_CANVAS.HEIGHT)

            this.player.draw(this.ctx);

        }

    }

    loop(timeStamp: number) {
        if (!this.isRunning) return

        // Calculate Delta Time (dt) in seconds
        const deltaTime = (timeStamp - this.lastTime) / 1000
        this.lastTime = timeStamp

        // Cap dt to prevent massive jumps during lag spikes
        const cappedDt = Math.min(deltaTime, 0.1)

        this.update(cappedDt)

        // Request next frame
        requestAnimationFrame(this.loop)
    }

}

//===============================================init========================
window.addEventListener('load', () => {
    const game = new Game();
    game.start();
})