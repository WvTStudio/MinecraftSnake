let sys = server.registerSystem(0, 0);
let my = {};

let playGround;
let snake;
let playerEntity;
let run;
let playerX = 0, playerZ = -10;

sys.initialize = function () {
	sys.listenForEvent("my:player_joined", (eventData) => my.onPlayerJoined(eventData.player));
};

let ticks = 0;
let timer = 0;

sys.update = function () {
	ticks++;
	if (ticks === 5) {
		ticks = 0;
		
		if (run === true) {
			// Event.chat("5ticks")；
			
			let comp = Entity.getPosition(playerEntity);
			let blockX = Math.floor(comp.x - playerX);
			let blockZ = Math.floor(comp.z - playerZ);
			if (blockZ === 0) {
				if (blockX === 1) {
					snake.turnRight();
				} else if (blockX === -1) {
					snake.turnLeft();
				}
			} else if (blockX === 0) {
				if (blockZ === 1) {
					snake.turnDown();
				} else if (blockZ === -1) {
					snake.turnUp();
				}
			}
			snake.update();
			playGround.clearGround();
			snake.draw();
		}
	}
};

my.onPlayerJoined = function (player) {
	playerEntity = player;
	playGround = new PlayGround(-10, 6, -40);
	snake = new Snake(playGround);
	playGround.clearGround();
	playGround.randomFood();
	run = true;
};

let Snake = function (playGround) {
	this.UP = 0;
	this.LEFT = 1;
	this.DOWN = 2;
	this.RIGHT = 3;
	
	// 游戏面板
	this.playGround = playGround;
	
	// 位置
	this.snakeHead = {
		x: 10,
		y: 10
	};
	// 身体
	this.snakeBodies = [{x: 9, y: 10}];
	// 速度
	this.speed = 1;
	// 方向
	this.direction = this.RIGHT;
	
	this.turnUp = function () {
		if (this.direction !== this.DOWN) {
			this.direction = this.UP;
		}
	};
	
	this.turnLeft = function () {
		if (this.direction !== this.RIGHT) {
			this.direction = this.LEFT;
		}
	};
	this.turnDown = function () {
		if (this.direction !== this.UP) {
			this.direction = this.DOWN;
		}
	};
	this.turnRight = function () {
		if (this.direction !== this.LEFT) {
			this.direction = this.RIGHT;
		}
	};
	this.update = function () {
		// Event.chat("update");
		switch (this.direction) {
			case this.UP:
				if (this.snakeHead.y < this.playGround.height)
					this.snakeHead.y += this.speed;
				else
					this.gameover();
				break;
			case this.DOWN:
				if (this.snakeHead.y > 0)
					this.snakeHead.y -= this.speed;
				else
					this.gameover();
				break;
			case this.RIGHT:
				if (this.snakeHead.x < this.playGround.width)
					this.snakeHead.x += this.speed;
				else
					this.gameover();
				break;
			case this.LEFT:
				if (this.snakeHead.x > 0)
					this.snakeHead.x -= this.speed;
				else
					this.gameover();
				break;
		}
		// Event.chat("iteratorFoods");
		// 吃食物
		for (let food of this.playGround.foods) {
			if (this.snakeHead.x === food.x && this.snakeHead.y === food.y) {
				this.playGround.removeFood(food);
				
				this.addBody(this.snakeBodies[this.snakeBodies.length - 1].x, this.snakeBodies[this.snakeBodies.length - 1].y);
			}
		}
	};
	
	this.addBody = function (x, y) {
		// Event.chat("addBody");
		this.snakeBodies.push({x: x, y: y});
	};
	
	this.draw = function () {
		// Event.chat("draw");
		for (let food of this.playGround.foods) {
			//food
			this.playGround.dot(food.x, food.y, "wool", 3);
		}
		for (let snakeBody of this.snakeBodies) {
			// body
			this.playGround.dot(snakeBody.x, snakeBody.y, "wool", 2);
		}
		// head
		this.playGround.dot(this.snakeHead.x, this.snakeHead.y, "wool", 1);
		
		// Event.chat(this.snakeBodies.length);
		for (let i = this.snakeBodies.length - 1; i >= 0; i--) {
			
			if (this.snakeHead.x === this.snakeBodies[i].x && this.snakeHead.y === this.snakeBodies[i].y) {
				this.gameover();
			}
			
			if (i === 0) {
				this.snakeBodies[i].x = this.snakeHead.x;
				this.snakeBodies[i].y = this.snakeHead.y;
			} else {
				this.snakeBodies[i].x = this.snakeBodies[i - 1].x;
				this.snakeBodies[i].y = this.snakeBodies[i - 1].y;
			}
		}
	};
	
	this.gameover = function () {
		Event.showTitle("@p","Game Over!");
	};
};

let PlayGround = function (xStart, yStart, zStart) {
	this.width = 20;
	this.height = 20;
	this.xStart = xStart;
	this.yStart = yStart;
	this.zStart = zStart;
	this.foods = [];
	
	let xEnd = this.xStart + this.width;
	let yEnd = this.yStart + this.height;
	let zEnd = this.zStart;
	
	this.clearGround = function () {
		Commands.fill(this.xStart, this.yStart, this.zStart, xEnd, yEnd, zEnd, "wool", 5);
	};
	
	// 重建自-x左向右+x，自-y下向上+y的坐标系
	this.dot = function (x, y, block, data) {
		Commands.setBlock(this.xStart + x, this.yStart + y, this.zStart, block, data);
	};
	
	this.addFood = function (food) {
		this.foods.push(food);
	};
	
	this.randomFood = function () {
		// Event.chat("12timers");
		let randomX = Math.round(Math.random() * playGround.width);
		let randomY = Math.round(Math.random() * playGround.height);
		// Event.chat("randomX: " + randomX + " randomY: " + randomY);
		playGround.addFood(new Food(randomX, randomY, 1));
	};
	
	this.removeFood = function (food) {
		this.randomFood();
		for (let i = 0; i < this.foods.length; i++) {
			if (this.foods[i] === food) {
				// 删除food
				this.foods.splice(i, 1);
			}
		}
	};
};

let Food = function (x, y, score) {
	this.x = x;
	this.y = y;
	this.score = score;
};

let Commands = {};
Commands.fill = function (fromX, fromY, fromZ, toX, toY, toZ, block) {
	sys.broadcastEvent("minecraft:execute_command", "fill " +
		fromX + " " +
		fromY + " " +
		fromZ + " " +
		toX + " " +
		toY + " " +
		toZ + " " +
		block
	);
};
Commands.fill = function (fromX, fromY, fromZ, toX, toY, toZ, block, data) {
	sys.broadcastEvent("minecraft:execute_command", "fill " +
		fromX + " " +
		fromY + " " +
		fromZ + " " +
		toX + " " +
		toY + " " +
		toZ + " " +
		block + " " +
		data
	);
};
Commands.setBlock = function (x, y, z, block) {
	sys.broadcastEvent("minecraft:execute_command", "setBlock " +
		x + " " +
		y + " " +
		z + " " +
		block
	);
};
Commands.setBlock = function (x, y, z, block, data) {
	sys.broadcastEvent("minecraft:execute_command", "setBlock " +
		x + " " +
		y + " " +
		z + " " +
		block + " " +
		data
	);
};

let Entity = {};
Entity.getPosition = function (entity) {
	if (sys.hasComponent(entity, "minecraft:position")) {
		return sys.getComponent(entity, "minecraft:position");
	} else {
		return null;
	}
};
Entity.setPosition = function (entity, position) {
	sys.applyComponentChanges(entity, position);
};

let Event = {};
Event.chat = function (content) {
	sys.broadcastEvent("minecraft:display_chat_event", content);
};
Event.showTitle = function (target, content) {
	sys.broadcastEvent("minecraft:execute_command", "title " + target + " title " + content)
};