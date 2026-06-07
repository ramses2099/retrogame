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

interface Color {
    fillStyle: string;    // Interior color
    strokeStyle: string;  // Border color
    lineWidth: number;    // Border thickness
}

interface Position {
    x: number;
    y: number;
}

interface Size {
    w: number;
    h: number;
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

abstract class GameObject {
    x: number
    y: number
    w: number
    h: number
    rect: Rect
    speed: number
    color: Color

    constructor(x: number, y: number, w: number = 64, h: number = 64, speed: number = 20) {
        this.w = w;
        this.h = h;
        this.x = x;
        this.y = y;
        this.rect = new Rect(this.x, this.y, this.w, this.h);
        this.speed = speed
        this.color = { fillStyle: "#3498db", strokeStyle: "#2c3e50", lineWidth: 5 };            // Border thickness
    }

    public setColor(color: Color): void { this.color = color; }
    public getRect(): Rect { return this.rect; }
    public abstract draw(ctx: CanvasRenderingContext2D): void;
    public abstract update(delataTime: number): void;
}


class Player extends GameObject {

    constructor() {
        super(0, 0);
    }

    setInitPosition(): void {
        this.rect.x = SIZE_CANVAS.WIDTH * 0.5 - this.rect.w * 0.5;
        this.rect.y = SIZE_CANVAS.HEIGHT - this.rect.h;
    }

    setInput(keys: Array<string>, delataTime: number): void {
        // HORIZONTAL MOVEMENT
        if (keys.indexOf('ArrowLeft') > -1) {
            this.rect.x -= this.speed * delataTime;
        }
        if (keys.indexOf('ArrowRight') > -1) {
            this.rect.x += this.speed * delataTime;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // 1. Set the visual styles
        ctx.fillStyle = this.color.fillStyle;    // Interior color
        ctx.strokeStyle = this.color.strokeStyle;  // Border color
        ctx.lineWidth = this.color.lineWidth;            // Border thickness

        // 2. Draw the interior fill
        ctx.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);

        // 3. Draw the border outline
        ctx.strokeRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
    }

    update(delataTime: number): void {
        // HORIZONTAL BOUNDARIES
        if (this.rect.x < -this.rect.w * 0.5) {
            this.rect.x = -this.rect.w * 0.5;
        } else if (this.rect.x > SIZE_CANVAS.WIDTH - this.rect.w * 0.5) {
            this.rect.x = SIZE_CANVAS.WIDTH - this.rect.w * 0.5;
        }
    }

    shoot(pp: ProjectilePool) {
        const p = pp.getProjectile()
        if (p != undefined) {
            p.start(this.rect.x + this.rect.w * 0.5, this.rect.y)
        }
    }
}

class Projectile {
    rect: Rect;
    speed: number;
    active: boolean;

    constructor() {
        this.rect = new Rect(0, 0);
        this.rect.w = 10;
        this.rect.h = 20;
        this.speed = 200;
        this.active = false;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.active) {
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
        if (this.active) {
            this.rect.y -= this.speed * delataTime;
            if (this.rect.y <= 0) {
                this.reset()
            }
        }
    }

    start(x: number, y: number): void {
        this.active = true;
        this.rect.x = x - this.rect.w * 0.5;
        this.rect.y = y;
    }
    reset(): void { this.active = false; }

}

class ProjectilePool {
    pp: Array<Projectile>

    constructor(numberOfProjectiles: number) {
        this.pp = new Array<Projectile>()

        for (let i = 0; i < numberOfProjectiles; i++) {
            this.pp.push(new Projectile());
        }
    }

    getProjectile(): Projectile | undefined {
        for (let i = 0; i < this.pp.length; i++) {
            const projectile = this.pp.at(i) as Projectile;
            if (!projectile.active) {
                return this.pp[i];
            }
        }
        return undefined;
    }

    update(delataTime: number, ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this.pp.length; i++) {
            const pr = this.pp.at(i) as Projectile;
            if (pr != undefined && pr.active) {
                pr.update(delataTime);
                pr.draw(ctx);
            }
        }
    }
}


class Enemy {
    rect: Rect
    speed: number

    constructor() {
        this.rect = new Rect(0, 0);
        this.rect.x = 0
        this.rect.y = 0
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

    update(delataTime: number): void {

    }
}

class Game {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    isRunning: boolean
    lastTime: number
    keys: Array<string>
    projectilesPool: ProjectilePool
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
        this.player.setInitPosition()
        // pool object
        this.projectilesPool = new ProjectilePool(10);


        this.initInput();
        this.loop = this.loop.bind(this);
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

            if (e.code === 'Space') {
                this.player.shoot(this.projectilesPool);
            }
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
        //INPUT 
        this.player.setInput(this.keys, deltaTime);

        //UPDATE
        this.player.update(deltaTime);

        // RENDER
        if (this.ctx != null) {
            this.ctx.clearRect(0, 0, SIZE_CANVAS.WIDTH, SIZE_CANVAS.HEIGHT)

            // Draw background
            //this.ctx.fillStyle = '#1a1a2e'
            //this.ctx.fillRect(0, 0, SIZE_CANVAS.WIDTH, SIZE_CANVAS.HEIGHT)

            this.player.draw(this.ctx);

            this.projectilesPool.update(deltaTime, this.ctx);

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