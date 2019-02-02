"use strict";

let sys = server.registerSystem(0, 0);

let controller;

let playground;
let run = false;

sys.initialize = function () {
	controller = new Controller();
	Scoreboard.addScoreboard();
	sys.listenForEvent("my:player_joined", (player) => My.onPlayerJoined(player));
	sys.listenForEvent("my:player_exited", (player) => My.onPlayerExited(player));
};

let tick = 0;
sys.update = function () {
	if (run === true) {
		if (++tick === 5) {
			tick = 0;
			// Event.chat("update");
			controller.update();
		}
	}
};

let My = {};
My.onPlayerJoined = function (playerEntity) {
	controller.addPlayer(playerEntity);
};

My.onPlayerExited = function (playerEntity) {

};

let Controller = function () {
	this.playGrounds = [];
	
	this.addPlayer = function (player) {
		// addPlayer
		this.playground = new PlayGround(this.playGrounds.length * 40, 5, 10, player);
		this.playGrounds.push(this.playground);
		Scoreboard.addPlayer(Entity.getName(player));
		Event.chat("Player Joined: " + player);
		this.playground.randomFood();
		run = true;
	};
	
	this.removePlayer = function (player) {
		// removePlayer
		Scoreboard.deletePlayer(Entity.getName(player));
	};
	
	this.update = function () {
		for (let playGround of this.playGrounds) {
			playGround.update();
			playGround.draw();
			
		}
	};
};

let PlayGround = function (x, y, z, player) {
	
	Event.chat("PlayGround");
	
	this.playerEntity = player;
	this.playerName = Entity.getName(player);
	
	this.height = 20;
	this.width = 20;
	
	this.xStart = x;
	this.yStart = y;
	this.zStart = z;
	this.xEnd = this.xStart + this.width;
	this.yEnd = this.yStart + this.height;
	this.zEnd = this.zStart;
	
	this.controlCenterX = this.xStart + 10.5;
	this.controlCenterY = this.yStart;
	this.controlCenterZ = this.zStart - 19.5;
	
	this.isOver = false;
	this.score = 0;
	
	this.snake = new Snake();
	this.foods = [];
	
	this.stop = function () {
	
	};
	
	this.remove = function () {
	
	};
	
	this.start = function () {
	
	};
	
	this.restart = function () {
	
	};
	
	// 清屏
	this.clearGround = function (color) {
		// Event.chat("PlayGround.clearGround()");
		Commands.fill(this.xStart, this.yStart, this.zStart, this.xEnd, this.yEnd, this.zEnd, "wool", color);
	};
	
	this.update = function () {
		// Event.chat("PlayGround.update()");
		if (this.isOver === false) {
			// 检测玩家的控制行为
			let pos = Entity.getPosition(this.playerEntity);
			// 玩家相对于控制中心的偏移
			let xOffset = pos.x - this.controlCenterX;
			let zOffset = pos.z - this.controlCenterZ;
			
			let absXOffset = Math.abs(xOffset);
			let absZOffset = Math.abs(zOffset);
			
			// Event.chat("xOffset: " + xOffset + " zOffset: " + zOffset);
			
			// 如果横向偏移大于纵向偏移
			if (absXOffset > absZOffset) {
				// 如果横向偏移为正
				if (xOffset > 0) {
					this.snake.turnRight();
				} else if (xOffset < 0) {
					this.snake.turnLeft();
				}
			} else if (absZOffset > absXOffset) {
				if (zOffset > 0) {
					this.snake.turnUp();
				} else if (zOffset < 0) {
					this.snake.turnDown();
				}
			}
			
			// 将玩家传送回去
			Entity.setPlayerPosition(this.playerName, this.controlCenterX, 4, this.controlCenterZ);
			
			// 更新贪吃蛇的位置
			this.snake.update();
			
			// 遍历身体
			for (let snakeBody of this.snake.snakeBodies) {
				// 如果碰到了身体
				if (this.snake.x === snakeBody.x && this.snake.y === snakeBody.y) {
					this.gameOver();
				}
			}
			
			// 如果头在场外
			if (this.snake.x < 0 || this.snake.x > this.width || // x轴不在场内
				this.snake.y < 0 || this.snake.y > this.height // y轴不在场内
			) {
				this.gameOver();
			}
			
			// 吃食物
			for (let food of this.foods) {
				if (this.snake.x === food.x && this.snake.y === food.y) {
					// 删除此食物
					this.removeFood(food);
					
					// 增加得分
					this.score++;
					
					// 随机生成一个食物
					this.randomFood();
					
					// 添加一个身体
					this.snake.addBody();
				}
			}
			
			this.draw();
		}
	};
	
	this.draw = function () {
		if (this.isOver === false) {
			// 清屏
			this.clearGround(5);
			// 绘制食物
			for (let food of this.foods) {
				this.dot(food.x, food.y, "wool", 3);
			}
			// 绘制身体
			for (let snakeBody of this.snake.snakeBodies) {
				this.dot(snakeBody.x, snakeBody.y, "wool", 2);
			}
			// 绘制头
			this.dot(this.snake.x, this.snake.y, "wool", 1);
		}
	};
	
	this.gameOver = function () {
		this.isOver = true;
		Event.showTitle("@p", "Game Over!");
		this.clearGround(1);
	};
	
	this.addFood = function (food) {
		this.foods.push(food);
	};
	
	this.randomFood = function () {
		let randomX = Math.round(Math.random() * this.width);
		let randomY = Math.round(Math.random() * this.height);
		this.addFood(new Food(randomX, randomY, 0));
	};
	
	this.removeFood = function (food) {
		for (let i = 0; i < this.foods.length; i++) {
			if (this.foods[i] === food) {
				// 删除food
				this.foods.splice(i, 1);
			}
		}
	};

	this.dot = function (x, y, block, data) {
		// 重建自-x左向右+x，自-y下向上+y的坐标系
		Commands.setBlock(this.xStart + x, this.yStart + y, this.zStart, block, data);
	};
};

let Food = function (x, y, foodType) {
	this.x = x;
	this.y = y;
	this.foodType = foodType;
};

let Snake = function () {
	Event.chat("Snake");
	
	this.UP = 0;
	this.LEFT = 1;
	this.DOWN = 2;
	this.RIGHT = 3;
	this.x = 10;
	this.y = 10;
	this.snakeBodies = [{x: 9, y: 10}];
	this.speed = 1;
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
		// 先移动身体
		for (let i = this.snakeBodies.length - 1; i >= 0; i--) {
			// 如果是第一个身体，则直接使用头的位置
			if (i === 0) {
				this.snakeBodies[i].x = this.x;
				this.snakeBodies[i].y = this.y;
			} else {
				// 如果不是则继承上一个身体的位置
				this.snakeBodies[i].x = this.snakeBodies[i - 1].x;
				this.snakeBodies[i].y = this.snakeBodies[i - 1].y;
			}
		}
		// 移动头
		switch (this.direction) {
			case this.UP:
				this.y += this.speed;
				break;
			case this.DOWN:
				this.y -= this.speed;
				break;
			case this.RIGHT:
				this.x += this.speed;
				break;
			case this.LEFT:
				this.x -= this.speed;
				break;
		}
	};
	
	this.addBody = function () {
		this.snakeBodies.push({x: [this.snakeBodies.length - 1].x, y: this.snakeBodies[this.snakeBodies.length - 1].y});
	};
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
		Event.chat("No this comp");
		return null;
	}
};
Entity.setPosition = function (entity, position) {
	sys.applyComponentChanges(entity, position);
};
Entity.setPlayerPosition = function (playerName, x, y, z) {
	sys.broadcastEvent("minecraft:execute_command", "tp \"" +
		playerName + "\" " +
		x + " " +
		y + " " +
		z
	);
};
Entity.getName = function (entity) {
	if (sys.hasComponent(entity, "minecraft:nameable")) {
		return sys.getComponent(entity, "minecraft:nameable").data.name;
	} else {
		return null;
	}
};

let Event = {};
Event.chat = function (content) {
	sys.broadcastEvent("minecraft:display_chat_event", content);
};
Event.showTitle = function (target, content) {
	sys.broadcastEvent("minecraft:execute_command", "title " + target + " title " + content)
};

let Scoreboard = {};
Scoreboard.changePlayerScore = function (playerName, score) {
	sys.broadcastEvent("minecraft:execute_command", "scoreboard players set " + playerName + " jfb " + score);
};
Scoreboard.addPlayer = function (playerName) {
	sys.broadcastEvent("minecraft:execute_command", "scoreboard players add " + playerName + " jfb 0");
};
Scoreboard.deletePlayer = function (playerName) {
	sys.broadcastEvent("minecraft:execute_command", "scoreboard players reset " + playerName + " jfb");
};
Scoreboard.addScoreboard = function () {
	sys.broadcastEvent("minecraft:execute_command", "scoreboard objectives add jfb dummy §6分数");
	sys.broadcastEvent("minecraft:execute_command", "scoreboard objectives setdisplay sidebar jfb");
};