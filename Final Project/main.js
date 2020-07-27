//Sound Variables
var bgSound;
var mySound;
var deathSound;
mySound = new Audio("pew.mp3");
bgSound = new Audio("uncharted.mp3");
deathSound = new Audio("oof.mp3");
bgSound.play();
//Image Variables
const playerImage = new Image();
playerImage.src = "spaceship.png";
const enemyImage = new Image();
enemyImage.src = "alien.png";
const laser = new Image();
laser.src = "laserbeam.png";
//Health bar
let health = document.getElementById("health");

window.onload = function () {
  // game constants
  const left = 37;
  const right = 39;
  const spacebar = 32;

  // canvas related stuff
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  // game related stuff
  const keysDown = {}; //whloe function for it
  const bullets = [];
  const enemies = [];
  let enemyNum = 0;
  const stars = [];
  let reload = 0;
  let initStars = 0;
  let score = 0;
  let gameOver = false;

  // for moving the enemies
  let movesToLeft = 0;
  let movesToRight = 0;
  let movesToCenter = 0;
  let enemyT = 0;
  let animate = 20;

  function Star(x, y, size, vy) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.vy = vy;
  }

  Star.prototype.draw = function () {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.size, this.size);
  };

  Star.prototype.update = function () {
    this.y += this.vy;
  };

  // the player
  const player = {
    x: 300,
    y: 567,
    size: 25,
    vx: 5,
    draw: function () {
      ctx.drawImage(playerImage, this.x, this.y, this.size, this.size);
    },
    update: function () {
      // move to left
      if (keysDown[left] && this.x > 0) {
        this.x -= this.vx;
      }

      // move to right
      if (keysDown[right] && this.x + this.size < canvas.height) {
        this.x += this.vx;
      }
    },
  };

  // constructor function to create missles
  function Bullet(x, y, size, vy, type) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.vy = vy;
    this.type = type;
  }

  Bullet.prototype.draw = function () {
    ctx.drawImage(laser, this.x, this.y, this.size, this.size);
  };

  Bullet.prototype.update = function () {
    this.y -= this.vy;
  };

  // function used to shoot bullets
  function shootBullet() {
    const bullet = new Bullet(
      player.size / 2 + player.x - 3,
      player.y - 10,
      6,
      5,
      "player"
    );

    bullets.push(bullet);
  }

  // constructor function for enemies
  function Enemy(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.alive = true;
    this.toShoot = Math.floor(Math.random() * (400 - 300) + 300);
    this.ticks = 0;
  }

  Enemy.prototype.update = function () {
    if (this.ticks == this.toShoot) {
      const bullet = new Bullet(
        this.size / 2 + this.x - 3,
        this.y + 5,
        6,
        -5,
        "enemy"
      );

      bullets.push(bullet);

      this.toShoot = Math.floor(Math.random() * (400 - 300) + 300);
      this.ticks = 0;
    }

    this.ticks++;
  };

  Enemy.prototype.draw = function () {
    ctx.drawImage(enemyImage, this.x, this.y, this.size, this.size);
  };

  // initialise the enemies
  function initEnemies() {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 4; j++) {
        const enemy = new Enemy(100 + 25 * i + 25 * i, 50 * j + 25, 25);

        enemies.push(enemy);
      }
    }

    enemyNum = enemies.length;
  }

  function moveEnemies() {
  
    if (movesToCenter == 2) {
      movesToLeft = 0;
      movesToRight = 0;
      movesToCenter = 0;
    }

    //  move to left
    if (movesToLeft < 3 && !movesToRight) {
      enemies.forEach(function (enemy) {
        enemy.x -= 25;
      });

      movesToLeft += 1;
    }

    //  move back to center
    if (movesToRight == 5 && movesToLeft == 3 && movesToCenter < 2) {
      enemies.forEach(function (enemy) {
        enemy.x -= 25;
        enemy.y += 10;
      });

      movesToCenter += 1;
    }

    // move to right
    if (movesToRight < 5 && movesToLeft == 3) {
      enemies.forEach(function (enemy) {
        enemy.x += 25;
      });

      movesToRight += 1;
    }
  }

  // check collision between two rectangles
  function checkCollision(rect1, rect2) {
    if (
      rect1.x < rect2.x + rect2.size &&
      rect1.x + rect1.size > rect2.x &&
      rect1.y < rect2.y + rect2.size &&
      rect1.size + rect1.y > rect2.y
    ) {
      return true;
    }
  }

  function run() {
    // time to create a new star
    if (initStars == 5) {
      const star = new Star(
        Math.floor(Math.random() * (600 - 10) + 10),
        -15,
        1,
        Math.floor(Math.random() * (10 - 1) + 1)
      );
      stars.push(star);
      initStars = 0;
    }

    // shoot bullets
    if (keysDown[spacebar] && reload > 30) {
      shootBullet();
      reload = 0;
      mySound.play();
   
    }

    // update stars
    stars.forEach(function (star, index) {
      star.update();

      // delete off-scene stars
      if (stars.x > canvas.height) {
        stars.splice(index, 1);
      }
    });

    // draw stars
    stars.forEach(function (star) {
      star.draw();
    });

    // update player
    player.update();

    // update all bullets
    bullets.forEach(function (bullet, index) {
      bullet.update();

      // delete all the bullets outside the scene
      if (bullet.x < 0 || bullet > canvas.height) {
        bullets.splice(1, index);
      }

      // if a bullet from an enemy hits the player
      if (bullet.type == "enemy" && checkCollision(bullet, player)) {
        health.value -= 10;
        if (health.value === 0) {
          gameOver = true;
          deathSound.play();
        }
      }
    });

    // draw bullets
    bullets.forEach(function (bullet) {
      bullet.draw();
    });

    // draw the player
    player.draw();

    if (enemyT == animate) {
      moveEnemies();
      enemyT = 0;
    }

    // update all enemies
    enemies.forEach(function (enemy, index) {
      // delete all dead enemies
      if (!enemy.alive) {
        enemies.splice(index, 1);
      }

      // if enemies are too close to our player
      if (enemy.y + enemy.size >= player.y) {
        gameOver = true;
      }

      enemy.update();
      bullets.forEach(function (bullet, bIndex) {
        // if a bullet from an enemy hits the player
        if (bullet.type == "player" && checkCollision(bullet, enemy)) {
          score += 1;
          enemy.alive = false;
          bullets.splice(bIndex, 1);
        }
      });
    });

    //  draw all enemies
    enemies.forEach(function (enemy) {
      enemy.draw();
    });

    // increment
    reload++;
    initStars++;
    enemyT++;
  }

  function drawEndingScene() {
    ctx.font = "25px Arial";
    if (score == enemyNum) {
      ctx.fillText("Winner! Congratulations!", 170, 300);
      ctx.fillText("Score: " + score, 200, 340);
    } else {
      ctx.fillText("Game Over! :(", 200, 300);
      ctx.fillText("Score: " + score, 200, 340);
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    window.requestAnimationFrame(loop);

    if (!gameOver && score != enemyNum) {
      run();
    } else {
      drawEndingScene();
    }
  }

  initEnemies();
  loop();

  // check for keyboard input
  window.addEventListener("keydown", function (keyupordown) {
    keysDown[keyupordown.keyCode] = true;
  });

  window.addEventListener("keyup", function (keyupordown) {
    keysDown[keyupordown.keyCode] = false;
  });
};
