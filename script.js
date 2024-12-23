window.addEventListener("load", function name() {
  /** @type {HTMLCanvasElement} */
  const canvas = this.document.getElementById("canvas1");

  const ctx = canvas.getContext("2d");

  canvas.width = 800;
  canvas.height = 500;

  class InputHandler {
    /**
     * @param {Game} game
     */
    constructor(game) {
      this.game = game;
      window.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          this.game.keys.add(e.key);
        } else if (e.key === " ") {
          this.game.player.shootTop();
        } else if (e.key === "d") {
          this.game.debug = !this.game.debug;
        }
      });

      window.addEventListener("keyup", (e) => {
        this.game.keys.delete(e.key);
      });
    }
  }

  class Projecttile {
    /**
     * @param {Game} game
     */
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.width = 10;
      this.height = 3;
      this.speed = 3; // 3px per frame
      this.markForDeletion = false;
      this.image = document.getElementById("projectile");
    }

    update() {
      this.x += this.speed;
      if (this.x > this.game.width * 0.8) {
        this.markForDeletion = true;
      }
    }

    draw(context) {
      context.drawImage(this.image, this.x, this.y);
    }
  }

  class Particle {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.image = document.getElementById("gears");
      this.frameX = Math.floor(Math.random() * 3);
      this.frameY = Math.floor(Math.random() * 3);
      this.spriteSize = 50;
      this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
      this.size = this.spriteSize * this.sizeModifier;
      this.speedX = Math.random() * 6 - 3;
      this.speedY = Math.random() * 0 - 15;
      this.gravity = 0.5;
      this.markForDeletion = false;
      this.angle = 0;
      this.velocityOfAngle = Math.random() * 0.2 - 0.1;
      this.bounced = 0;
      this.bottomBounceBoundary = Math.random() * 80 + 60;
    }

    update() {
      this.angle += this.velocityOfAngle;
      this.speedY += this.gravity;
      this.x -= this.speedX + this.game.speed;
      this.y += this.speedY;

      if (this.y > this.height + this.size || this.x < 0 - this.size) {
        this.markForDeletion = true;
      }

      if (
        this.y > this.game.height - this.bottomBounceBoundary &&
        this.bounced < 2
      ) {
        this.bounced++;
        this.speedY *= -0.5;
      }
    }

    draw(context) {
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.angle);
      context.drawImage(
        this.image,
        this.frameX * this.spriteSize,
        this.frameY * this.spriteSize,
        this.spriteSize,
        this.spriteSize,
        this.size * -0.5,
        this.size * -0.5,
        this.size,
        this.size
      );
      context.restore();
    }
  }

  class Player {
    /**
     * @param {Game} game
     */
    constructor(game) {
      this.game = game;
      // Player sprite sheet
      this.width = 120;
      this.height = 190;

      this.x = 20;
      this.y = 100;

      this.speedY = 0;
      this.maxSpeed = 2;

      this.projectiles = [];

      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;

      this.image = document.getElementById("player");
      this.powerUp = false;
      this.powerUpTimer = 0;
      this.powerUpLimit = 10 * 1000;
    }

    update(deltaTime) {
      if (this.game.keys.has("ArrowUp")) {
        this.speedY = -this.maxSpeed;
      } else if (this.game.keys.has("ArrowDown")) {
        this.speedY = this.maxSpeed;
      } else {
        this.speedY = 0;
      }
      this.y += this.speedY;
      //vertical boundaries

      if (this.y > this.game.height - this.height * 0.5) {
        this.y = this.game.height - this.height * 0.5;
      } else if (this.y < -this.height * 0.5) {
        this.y = -this.height * 0.5;
      }
      // Handle projectiles
      this.projectiles.forEach((projecttile) => {
        projecttile.update();
      });

      this.projectiles = this.projectiles.filter(
        (projecttile) => projecttile.markForDeletion === false
      );

      // sprite animation

      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }

      // Power up
      if (this.powerUp) {
        if (this.powerUpTimer > this.powerUpLimit) {
          this.powerUpTimer = 0;
          this.powerUp = false;
          this.frameY = 0;
        } else {
          this.powerUpTimer += deltaTime;
          this.frameY = 1;
          this.game.ammo += 0.1;
        }
      }
    }

    /**
     * @param {CanvasRenderingContext2D} context
     */
    draw(context) {
      if (this.game.debug) {
        context.strokeRect(this.x, this.y, this.width, this.height);
      }
      this.projectiles.forEach((projecttile) => {
        projecttile.draw(context);
      });

      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY + this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }

    shootTop() {
      if (this.game.ammo > 0) {
        this.projectiles.push(
          new Projecttile(this.game, this.x + 80, this.y + 30)
        );
        this.game.ammo--;
      }
      if (this.powerUp) {
        this.shootBottom();
      }
    }

    shootBottom() {
      if (this.game.ammo > 0) {
        this.projectiles.push(
          new Projecttile(this.game, this.x + 80, this.y + 175)
        );
      }
    }

    enterPowerUp() {
      this.powerUpTimer = 0;
      this.powerUp = true;
      if (this.game.ammo < this.game.maxAmmo) {
        this.game.ammo = this.game.maxAmmo;
      }
    }
  }

  class Enemy {
    constructor(game) {
      this.game = game;
      this.x = this.game.width;
      this.speedX = Math.random() * -1.5 - 0.5;
      this.markForDeletion = false;
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
    }

    update() {
      this.x += this.speedX - this.game.speed;

      if (this.x + this.width < 0) {
        this.markForDeletion = true;
      }

      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
    }

    draw(context) {
      if (this.game.debug) {
        context.strokeRect(this.x, this.y, this.width, this.height);
      }

      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY + this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );

      if (this.game.debug) {
        context.font = "20px Arial";
        context.fillText(this.lives, this.x, this.y);
      }
    }
  }

  class Angler1 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 228;
      this.height = 169;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("angler1");

      this.frameY = Math.floor(Math.random() * 3);

      this.lives = 2;
      this.score = this.lives;
    }
  }

  class Angler2 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 213;
      this.height = 165;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("angler2");

      this.frameY = Math.floor(Math.random() * 2);

      this.lives = 3;
      this.score = this.lives;
    }
  }

  class LuckyFish extends Enemy {
    constructor(game) {
      super(game);
      this.width = 99;
      this.height = 95;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("lucky");

      this.frameY = Math.floor(Math.random() * 2);

      this.lives = 3;
      this.score = this.lives * 5;

      this.type = "lucky";
    }
  }

  class HiveWhale extends Enemy {
    constructor(game) {
      super(game);

      this.width = 400;
      this.height = 227;

      this.y = Math.random() * (this.game.height * 0.95 - this.height);

      this.image = document.getElementById("hivewhale");

      this.frameY = 0;

      this.lives = 15;
      this.score = this.lives;

      this.type = "hive";
      this.speedX = Math.random() * -1.2 - 0.2;
    }
  }

  class Layer {
    constructor(game, image, speedModifier) {
      this.game = game;
      this.image = image;
      this.speedModifier = speedModifier;
      this.width = 1768;
      this.height = 500;
      this.x = 0;
      this.y = 0;
    }

    update() {
      if (this.x <= -this.width) {
        this.x = 0;
      }
      this.x -= this.game.speed * this.speedModifier;
    }

    draw(context) {
      context.drawImage(this.image, this.x, this.y);
      context.drawImage(this.image, this.x + this.width, this.y);
    }
  }

  class Background {
    constructor(game) {
      this.game = game;
      this.image1 = document.getElementById("layer1");
      this.image2 = document.getElementById("layer2");
      this.image3 = document.getElementById("layer3");
      this.image4 = document.getElementById("layer4");

      this.layer1 = new Layer(this.game, this.image1, 0.2);
      this.layer2 = new Layer(this.game, this.image2, 0.4);
      this.layer3 = new Layer(this.game, this.image3, 1);
      this.layer4 = new Layer(this.game, this.image4, 1.5);

      this.layers = [this.layer1, this.layer2, this.layer3];
    }

    update() {
      this.layers.forEach((layer) => {
        layer.update();
      });
    }

    draw(context) {
      this.layers.forEach((layer) => {
        layer.draw(context);
      });
    }
  }

  class UI {
    constructor(game) {
      this.game = game;
      this.fontSize = 25;
      this.fontFamily = "Bangers";
      this.color = "white";
    }

    draw(context) {
      //score
      context.save();
      context.fillStyle = this.color;
      context.font = `${this.fontSize}px ${this.fontFamily}`;

      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = "#000";
      context.fillText(`Score: ${this.game.score}`, 20, 40);

      // ammo
      if (this.game.player.powerUp) {
        context.fillStyle = "#ffffbd";
      }

      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(20 + 5 * i, 50, 3, 20);
      }

      // Timer
      const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
      context.fillText("Timer: " + formattedTime, 20, 100);

      // Game over message
      if (this.game.gameOver) {
        context.textAlign = "center";
        let message1 = "";
        let message2 = "";

        if (this.game.score > this.game.winningScore) {
          message1 = "You win!";
          message2 = "Well done!";
        } else {
          message1 = "You lose!";
          message2 = "Try again next time!";
        }

        context.font = `70px ${this.fontFamily}`;
        context.fillText(
          message1,
          this.game.width * 0.5,
          this.game.height * 0.5 - 20
        );

        context.font = `25px ${this.fontFamily}`;
        context.fillText(
          message2,
          this.game.width * 0.5,
          this.game.height * 0.5 + 20
        );
      }

      context.restore();
    }
  }

  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;

      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.ui = new UI(this);
      /** @type {Set<string>} */
      this.keys = new Set();

      this.ammo = 20;
      this.maxAmmo = 50;
      this.ammoTimer = 0;
      this.ammoInterval = 500; // 500ms

      this.enemies = [];
      this.enemyTimer = 0;
      this.enemyInterval = 1000;

      this.gameOver = false;

      this.score = 0;
      this.winningScore = 10;

      this.gameTime = 0;
      this.timeLimit = 1500 * 1000;

      this.speed = 1;

      this.background = new Background(this);

      this.debug = false;
      this.particles = [];
    }

    update(deltaTime) {
      if (!this.gameOver) {
        this.gameTime += deltaTime;
      }

      if (this.gameTime > this.timeLimit) {
        this.gameOver = true;
      }

      this.player.update(deltaTime);

      this.background.update();
      this.background.layer4.update();

      if (this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo) {
          this.ammo++;
        }

        this.ammoTimer = 0;
      } else {
        this.ammoTimer += deltaTime;
      }

      // particles
      this.particles.forEach((particle) => {
        particle.update();
      });
      this.particles.filter((particle) => !particle.markForDeletion);

      this.enemies.forEach((enemy) => {
        enemy.update();
        if (this.checkCollision(this.player, enemy)) {
          enemy.markForDeletion = true;
          for (let i = 0; i < 10; i++) {
            this.particles.push(
              new Particle(
                this,
                enemy.x + enemy.width * 0.5,
                enemy.y + enemy.height * 0.5
              )
            );
          }

          if (enemy.type === "lucky") {
            this.player.enterPowerUp();
          } else {
            this.score--;
          }
        }

        this.player.projectiles.forEach((projecttile) => {
          if (this.checkCollision(projecttile, enemy)) {
            projecttile.markForDeletion = true;
            enemy.lives--;
            this.particles.push(
              new Particle(
                this,
                enemy.x + enemy.width * 0.5,
                enemy.y + enemy.height * 0.5
              )
            );

            if (enemy.lives < 1) {
              for (let i = 0; i < 10; i++) {
                this.particles.push(
                  new Particle(
                    this,
                    enemy.x + enemy.width * 0.5,
                    enemy.y + enemy.height * 0.5
                  )
                );
              }
              enemy.markForDeletion = true;

              if (!this.gameOver) {
                this.score += enemy.score;
              }

              if (this.score > this.winningScore) {
                this.gameOver = true;
              }
            }
          }
        });
      });
      this.enemies = this.enemies.filter((enemy) => !enemy.markForDeletion);

      if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
    }

    draw(context) {
      this.background.draw(context);
      this.ui.draw(context);

      this.player.draw(context);

      this.particles.forEach((particle) => {
        particle.draw(context);
      });

      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });

      this.background.layer4.draw(context);
    }

    addEnemy() {
      const randomValue = Math.random();

      let newEnemy;

      if (randomValue < 0.3) {
        newEnemy = new Angler1(this);
      } else if (randomValue < 0.6) {
        newEnemy = new Angler2(this);
      } else if (randomValue < 0.8) {
        newEnemy = new HiveWhale(this);
      } else {
        newEnemy = new LuckyFish(this);
      }

      this.enemies.push(newEnemy);
    }

    checkCollision(rect1, rect2) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    }
  }

  const game = new Game(canvas.width, canvas.height);
  let lastTime = 0;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime);
    game.draw(ctx);
    requestAnimationFrame(animate);
  }

  animate(0);
});
