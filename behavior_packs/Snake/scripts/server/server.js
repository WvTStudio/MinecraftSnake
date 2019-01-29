let sys = server.registerSystem(0, 0);
let My = {};

let playGround;
let snake;
let playerEntity;

let run;

// 玩家的默认坐标，用于检测玩家的控制
let playerX = 0, playerZ = -10;

// 全局的游戏控制器
// let controller = new Controller();

sys.initialize = function () {
	sys.listenForEvent("my:player_joined", (playerEntity) => My.onPlayerJoined(playerEntity));
	sys.listenForEvent("my:player_exited", (playerEntity) => My.onPlayerExited(playerEntity));
};

// 游戏刻计数器
let ticks = 0;
sys.update = function () {
	
	ticks++;
	if (ticks === 5) {
		ticks = 0;
		
		// controller.update();
		
		if (run === true) {
			// Event.chat("5ticks");
			
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
			playGround.clearGround(5);
			snake.draw();
		}
	}
};

/**
 * 当玩家进入世界时被调用
 * @param player 玩家实体
 */
My.onPlayerJoined = function (player) {
	playerEntity = player;
	playGround = new PlayGround(-10, 6, -40, 0);
	snake = new Snake(playGround);
	playGround.clearGround();
	playGround.randomFood();
	run = true;
	
	// 添加一个玩家
	// controller.addPlayer(player);
};

/**
 * 当玩家退出世界时被调用
 * @param player 玩家实体
 */
My.onPlayerExited = function (player) {
	// controller.removePlayer(player);
};

/**
 * 表示一条贪吃蛇
 * @param playGround 对应的面板
 * @constructor
 */
let Snake = function (playGround) {
	this.UP = 0;
	this.LEFT = 1;
	this.DOWN = 2;
	this.RIGHT = 3;
	// 游戏面板
	this.playGround = playGround;
	// 蛇头位置
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
	
	/**
	 * 向上转
	 */
	this.turnUp = function () {
		if (this.direction !== this.DOWN) {
			this.direction = this.UP;
		}
	};
	/**
	 * 向左转
	 */
	this.turnLeft = function () {
		if (this.direction !== this.RIGHT) {
			this.direction = this.LEFT;
		}
	};
	/**
	 * 向左转
	 */
	this.turnDown = function () {
		if (this.direction !== this.UP) {
			this.direction = this.DOWN;
		}
	};
	/**
	 * 向右转
	 */
	this.turnRight = function () {
		if (this.direction !== this.LEFT) {
			this.direction = this.RIGHT;
		}
	};
	/**
	 * 更新一次位置
	 */
	this.update = function () {
		// Event.chat("update");
		switch (this.direction) {
			case this.UP:
				if (this.snakeHead.y < this.playGround.height)
					this.snakeHead.y += this.speed;
				else
					this.gameOver();
				break;
			case this.DOWN:
				if (this.snakeHead.y > 0)
					this.snakeHead.y -= this.speed;
				else
					this.gameOver();
				break;
			case this.RIGHT:
				if (this.snakeHead.x < this.playGround.width)
					this.snakeHead.x += this.speed;
				else
					this.gameOver();
				break;
			case this.LEFT:
				if (this.snakeHead.x > 0)
					this.snakeHead.x -= this.speed;
				else
					this.gameOver();
				break;
		}
		// Event.chat("iteratorFoods");
		// 吃食物
		for (let food of this.playGround.foods) {
			if (this.snakeHead.x === food.x && this.snakeHead.y === food.y) {
				this.playGround.removeFood(food);
				this.playGround.randomFood();
				this.addBody(this.snakeBodies[this.snakeBodies.length - 1].x, this.snakeBodies[this.snakeBodies.length - 1].y);
			}
		}
	};
	/**
	 * 添加一个身体
	 * @param x
	 * @param y
	 */
	this.addBody = function (x, y) {
		// Event.chat("addBody");
		this.snakeBodies.push({x: x, y: y});
	};
	/**
	 * 绘制该贪吃蛇
	 */
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
				this.gameOver();
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
	this.gameOver = function () {
		Event.showTitle("@p", "Game Over!");
		run = false;
		this.playGround.clearGround(1);
	};
};

/**
 * 表示一个游戏画布，一个游戏画布即为一场游戏
 * @param xStart 游戏面板的x轴起始位置
 * @param yStart 游戏面板的y轴起始位置
 * @param zStart 游戏面板的z轴起始位置
 * @param player 绑定的玩家
 * @constructor
 */
let PlayGround = function (xStart, yStart, zStart, player) {
	this.width = 20;
	this.height = 20;
	
	this.xStart = xStart;
	this.yStart = yStart;
	this.zStart = zStart;
	
	this.foods = [];
	
	this.playerEntity = player;
	this.snake = new Snake();
	
	let xEnd = this.xStart + this.width;
	let yEnd = this.yStart + this.height;
	let zEnd = this.zStart;
	
	/**
	 * 清屏
	 */
	this.clearGround = function (color) {
		Commands.fill(this.xStart, this.yStart, this.zStart, xEnd, yEnd, zEnd, "wool", color);
	};
	
	/**
	 * 在面板上绘制一个点
	 * @param x 横坐标
	 * @param y 纵坐标
	 * @param block 方块
	 * @param data 方块特殊值
	 */
	this.dot = function (x, y, block, data) {
		// 重建自-x左向右+x，自-y下向上+y的坐标系
		Commands.setBlock(this.xStart + x, this.yStart + y, this.zStart, block, data);
	};
	
	/**
	 * 添加一个食物
	 * @param food 食物对象
	 */
	this.addFood = function (food) {
		this.foods.push(food);
	};
	
	/**
	 * 添加一个随机坐标、随机类型的食物
	 */
	this.randomFood = function () {
		// Event.chat("12timers");
		let randomX = Math.round(Math.random() * playGround.width);
		let randomY = Math.round(Math.random() * playGround.height);
		// Event.chat("randomX: " + randomX + " randomY: " + randomY);
		playGround.addFood(new Food(randomX, randomY, 1));
	};
	
	/**
	 * 移除一个食物
	 * @param food 食物的对象
	 */
	this.removeFood = function (food) {
		for (let i = 0; i < this.foods.length; i++) {
			if (this.foods[i] === food) {
				// 删除food
				this.foods.splice(i, 1);
			}
		}
	};
	
	/**
	 * 更新一次游戏画布
	 */
	this.update = function () {
		this.snake.update();
	};
	
	/**
	 * 获取当前得分
	 * @returns {number} 得分
	 */
	this.getScore = function () {
		return 0;
	};
	
	/**
	 * 通知游戏结束
	 */
	this.gameOver = function () {
	
	};
	
	/**
	 * 检测游戏是否已经结束
	 * @returns {boolean}
	 */
	this.isOver = function () {
		return false;
	};
};

/**
 * 游戏控制类，用于控制初始化、玩家加入、玩家退出
 * @constructor
 */
let Controller = function () {
	this.playGrounds = [];
	this.players = [];
	/**
	 * 添加一个玩家
	 * @param player 玩家的实体
	 */
	this.addPlayer = function (player) {
		this.plays.push(player);
	};
	
	/**
	 * 删除一个玩家
	 * @param player 玩家的实体
	 */
	this.removePlayer = function (player) {
		for (let i = 0; i < players.length; i++) {
			if (this.players[i] === player) {
				//移除玩家
				this.players.splice(i, 1);
			}
		}
	};
	
	/**
	 * 对游戏面板进行一次更新
	 * 此方法会对所有游戏面板的数据进行更新，并绘制所有面板
	 */
	this.update = function () {
		for (playGround of playGrounds) {
			playGround.update();
			playGround.draw();
		}
	}
};

/**
 * 表示一个食物，存储食物的坐标及分数
 * @param x 横坐标
 * @param y 纵坐标
 * @param type 食物的类型，有normal、big等，不同类型所对应的得分及效果不同
 * @constructor
 */
let Food = function (x, y, type) {
	this.x = x;
	this.y = y;
	this.type = type;
};

let Commands = {};
/**
 * 广播一条填充方块的事件
 * @param fromX X轴起始位置
 * @param fromY Y轴起始位置
 * @param fromZ Z轴起始位置
 * @param toX X轴结束位置
 * @param toY Y轴结束位置
 * @param toZ Z轴结束位置
 * @param block 所要填充的方块
 */
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

/**
 * 广播一条填充方块的事件
 * @param fromX X轴起始位置
 * @param fromY Y轴起始位置
 * @param fromZ Z轴起始位置
 * @param toX X轴结束位置
 * @param toY Y轴结束位置
 * @param toZ Z轴结束位置
 * @param block 所要填充的方块
 * @param data 所要填充的方块的特殊值
 */
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

/**
 * 广播一条放置方块的事件
 * @param x X轴坐标
 * @param y Y轴坐标
 * @param z Z轴坐标
 * @param block 所要放置的方块的标识符
 */
Commands.setBlock = function (x, y, z, block) {
	sys.broadcastEvent("minecraft:execute_command", "setBlock " +
		x + " " +
		y + " " +
		z + " " +
		block
	);
};

/**
 * 广播一条放置方块的事件
 * @param x X轴坐标
 * @param y Y轴坐标
 * @param z Z轴坐标
 * @param block 所要放置的方块的标识符
 * @param data 所要放置的方块的特殊值
 */
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
/**
 * 获取一个实体的坐标组件
 * @param entity 实体的对象
 * @returns 实体的坐标组件
 */
Entity.getPosition = function (entity) {
	if (sys.hasComponent(entity, "minecraft:position")) {
		return sys.getComponent(entity, "minecraft:position");
	} else {
		return null;
	}
};
/**
 * 设置一个实体的坐标
 * @param entity 实体的对象
 * @param position 坐标
 */
Entity.setPosition = function (entity, position) {
	sys.applyComponentChanges(entity, position);
};

let Event = {};
/**
 * 向聊天栏发送一条消息
 * @param content 消息内容
 */
Event.chat = function (content) {
	sys.broadcastEvent("minecraft:display_chat_event", content);
};
/**
 * 显示一个标题
 * @param target 目标
 * @param content 标题的内容
 */
Event.showTitle = function (target, content) {
	sys.broadcastEvent("minecraft:execute_command", "title " + target + " title " + content)
};
