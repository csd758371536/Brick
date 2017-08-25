(function(){
	'use strict';

	/* 定义小球 */
	var Ball = function(x, y) {
		this.ballPositionX = x; // 小球球心X坐标
		this.ballPositionY = y; // 小球球心Y坐标
		this.ballSpeedX = this.ballSpeed; // 小球X方向的速度
		this.ballSpeedY = this.ballSpeed; // 小球Y方向的速度
	};
	
	Ball.prototype = {
		ballRadius: 10, // 小球半径
		ballSpeed: 4, // 小球速度
		ballColor: "#eee", // 小球颜色
		// 绘制小球
		drawBall: function(x, y, context) {
			context.beginPath();
		    context.arc(x, y, this.ballRadius, 0, Math.PI * 2, true);
		    context.fillStyle = this.ballColor;
		    context.fill();
		    context.closePath();
		},
		// 改变小球球心X坐标
		moveBallPositionX: function(speed) {
			this.ballPositionX = this.ballPositionX + speed;
		},
		// 改变小球球心Y坐标
		moveBallPositionY: function(speed) {
			this.ballPositionY = this.ballPositionY + speed;
		},
		// 检测小球是否与球板或者砖块碰撞（算法暂时存在bug，待优化）
		checkBallCollide: function(x, y, width, height) {
			var ballX = this.ballPositionX - (x + width / 2);
			var ballY = (y + height / 2) - this.ballPositionY;

			if (ballX < 0) {
				ballX = -ballX;
			}

			if (ballY < 0) {
				ballY = -ballY;
			}

			var vX = ballX;
			var vY = ballY;

			var hX = width / 2;
			var hY = height / 2;

			var uX = vX - hX;
			var uY = vY - hY;

			if (uX < 0) {
				uX = 0;
			}
			if (uY < 0) {
				uY = 0;
			}

			// if (this.ballPositionX > x - this.ballRadius && this.ballPositionX < x + width + this.ballRadius &&
			// 	 this.ballPositionY > y - this.ballRadius && this.ballPositionY < y + height + this.ballRadius) {

			// 发生碰撞
			if (uX*uX + uY*uY < this.ballRadius*this.ballRadius) {
				var a1 = y + height / 2 - this.ballPositionY;
				var b1 = x + width / 2 - this.ballPositionX;

				// 将小球球心坐标进行简单的修正，防止卡在砖块内部形成死循环的bug
				if (a1 > 0) {
					if (b1 > 0) {
						if (a1 / b1 > height / width) {
							this.ballPositionY = y - this.ballRadius;
						} else if (a1 / b1 < height / width) {
							this.ballPositionX = x - this.ballRadius;
						} else {
							this.ballPositionX = x - this.ballRadius;
							this.ballPositionY = y - this.ballRadius;
						}
					} else {
						if (a1 / -b1 > height / width) {
							this.ballPositionY = y - this.ballRadius;
						} else if (a1 / -b1 < height / width) {
							this.ballPositionX = x + width + this.ballRadius;
						} else {
							this.ballPositionX = x + width + this.ballRadius;
							this.ballPositionY = y - this.ballRadius;
						}
					}
				} else {
					if (b1 > 0) {
						if (-a1 / b1 > height / width) {
							this.ballPositionY = y + height + this.ballRadius;
						} else if (-a1 / b1 < height / width) {
							this.ballPositionX = x - this.ballRadius;
						} else {
							this.ballPositionX = x - this.ballRadius;
							this.ballPositionY = y + height + this.ballRadius;
						}
					} else {
						if (-a1 / -b1 > height / width) {
							this.ballPositionY = y + height + this.ballRadius;
						} else if (-a1 / -b1 < height / width) {
							this.ballPositionX = x + width + this.ballRadius;
						} else {
							this.ballPositionX = x + width + this.ballRadius;
							this.ballPositionY = y + height + this.ballRadius;
						}
					}
				}

				// 防止小球卡在墙壁内部
				if (this.ballPositionX > canvasWidth - this.ballRadius) {
					this.ballPositionX = canvasWidth - this.ballRadius;
				}
				if (this.ballPositionX < this.ballRadius) {
					this.ballPositionX = this.ballRadius;
				}

				if (a1 < 0) {
					a1 = this.ballPositionY - (y + height / 2);
				}

				if (b1 < 0) {	
					b1 = this.ballPositionX - (x + width / 2);
				}

				// 根据角度来判断反弹方向
				if (a1 / b1 > height / width) {
					this.ballSpeedY = -this.ballSpeedY;
					return true;
				} else if (a1 / b1 < height / width) {
					this.ballSpeedX = -this.ballSpeedX;
					return true;
				} else {
					this.ballSpeedX = -this.ballSpeedX;
					this.ballSpeedY = -this.ballSpeedY;
					return true;
				}
			}

			return false;
		}
	};
	

	/* 定义球板 */
	var Board = function(x, y) {
		this.boardPositionX = x; // 球板位置X坐标
		this.boardPositionY = y; // 球板位置Y坐标
	};

	Board.prototype = {
		boardWidth: 80, // 球板宽度
		boardHeigth: 10, // 球板高度
		boardSpeed: 40, // 球板速度
		boardColor: "#000", // 球板颜色
		// 绘制球板
		drawBoard: function(x, y) {
			context.beginPath();
		    context.fillStyle = this.boardColor;
		    context.fillRect(x, y, this.boardWidth, this.boardHeigth);
		    context.closePath();
		},
		// 检测球板位置
		checkBoardPosition: function(speed) {
			if (this.boardPositionX + speed < 0) {
				this.boardPositionX = 0;
				this.drawBoard(this.boardPositionX, this.boardPositionY);
				return -1;
			} 
			if (this.boardPositionX + speed > canvasWidth - this.boardWidth) {
				this.boardPositionX = canvasWidth - this.boardWidth;
				this.drawBoard(this.boardPositionX, this.boardPositionY);
				return 0;
			}
			return 1;
		},
		// 移动球板
		moveBoard: function(speed) {
			if (this.checkBoardPosition(speed) == 1) {
				this.boardPositionX = this.boardPositionX + speed;
				this.drawBoard(this.boardPositionX, this.boardPositionY);
			}
		}
	};

	/* 定义砖块 */
	var Brick = function(x, y, level) {
		this.brickPositionX = x;
		this.brickPositionY = y;
		this.brickLevel = level;
	};

	Brick.prototype = {
		brickWidth: 40, // 砖块宽度
		brickHeight: 20 // 砖块高度
	};

	var Bricks = function() {};

	Bricks.prototype = {
		brickColors: [],
		// 绘制砖块
		drawBrick: function(game) {
			var config = this.bricksConfig[game.gameLevel - 1];

			for (var i = 0; i < config.length; i++) {
				context.beginPath();
			    context.fillStyle = this.brickColors[i];
			    context.fillRect(config[i].brickPositionX, config[i].brickPositionY, config[i].brickWidth, config[i].brickHeight);
			    context.closePath();
			}
		},
		// 初始化方块颜色
		initBrickColors: function () {
			var config = this.bricksConfig[game.gameLevel - 1];

			for (var i = 0; i < config.length; i++) {
				this.brickColors.push('rgb('+this.getRandNum(255)+','+this.getRandNum(255)+','+this.getRandNum(255)+')');
			}
        },
        // 生成随机数
        getRandNum: function (num) {
            return Math.floor(Math.random() * num + 1);
        },
		// 砖块配置信息
		bricksConfig: [
			// 第一关
			[
				// 左上到右下
				new Brick(40,   40, 2), new Brick(80,   60, 1), new Brick(120,  80, 1),
				new Brick(160, 100, 1), new Brick(200, 120, 1), new Brick(240, 140, 1),
				new Brick(280, 160, 1), new Brick(320, 180, 1), new Brick(360, 200, 1),
				new Brick(400, 220, 1), new Brick(440, 240, 1), new Brick(480, 260, 1),
				new Brick(520, 280, 1), new Brick(560, 300, 2), 

				// 左下到右上
				new Brick(40,  300, 2), new Brick(80,  280, 1), new Brick(120, 260, 1),
				new Brick(160, 240, 1), new Brick(200, 220, 1), new Brick(240, 200, 1),
				new Brick(280, 180, 1), new Brick(320, 160, 1), new Brick(360, 140, 1),
				new Brick(400, 120, 1), new Brick(440, 100, 1), new Brick(480,  80, 1),
				new Brick(520,  60, 1), new Brick(560,  40, 2),

				// 上
				new Brick(80,  40, 2), new Brick(120, 40, 2), new Brick(160, 40, 2),
				new Brick(200, 40, 2), new Brick(240, 40, 2), new Brick(280, 40, 2),
				new Brick(320, 40, 2), new Brick(360, 40, 2), new Brick(400, 40, 2),
				new Brick(440, 40, 2), new Brick(480, 40, 2), new Brick(520, 40, 2),

				// 下
				new Brick(80,  300, 3), new Brick(120, 300, 3), new Brick(160, 300, 3),
				new Brick(200, 300, 3), new Brick(240, 300, 3), new Brick(280, 300, 3),
				new Brick(320, 300, 3), new Brick(360, 300, 3), new Brick(400, 300, 3),
				new Brick(440, 300, 3), new Brick(480, 300, 3), new Brick(520, 300, 3),

				// 左
				new Brick(40,  60, 2), new Brick(40, 80,  2), new Brick(40, 100, 2),
				new Brick(40, 120, 2), new Brick(40, 140, 2), new Brick(40, 160, 2),
				new Brick(40, 180, 2), new Brick(40, 200, 2), new Brick(40, 220, 2),
				new Brick(40, 240, 2), new Brick(40, 260, 2), new Brick(40, 280, 2),

				// 右
				new Brick(560,  60, 2), new Brick(560, 80,  2), new Brick(560, 100, 2),
				new Brick(560, 120, 2), new Brick(560, 140, 2), new Brick(560, 160, 2),
				new Brick(560, 180, 2), new Brick(560, 200, 2), new Brick(560, 220, 2),
				new Brick(560, 240, 2), new Brick(560, 260, 2), new Brick(560, 280, 2)
			],
			// 第二关
			[
				
			]
		]
	};

	/* 定义游戏状态 */
	var Game = function(gameStart, gameScore, gameLife, gameLevel) {
		this.gameStart = gameStart; // 游戏是否开始
		this.gameScore = gameScore; // 游戏得分
		this.gameLife = gameLife; // 游戏生命条数
		this.gameLevel = gameLevel; // 游戏关卡数
	};
	
	Game.prototype = {
		// 设置游戏分数
		setGameScore: function(gameScore) {
			document.getElementById("score").innerHTML = gameScore;
		},
		// 设置游戏生命
		setGameLife: function(gameLife) {
			document.getElementById("life").innerHTML = gameLife;
		}
	};

	/* 程序基本配置 */
	var canvas = document.getElementById("canvas"); // 获得canvas元素
	var context = canvas.getContext("2d"); // 获得context对象
	var canvasWidth = 640; // 定义画布宽度
	var canvasHeight = 480; // 定义画布高度
	
	canvas.setAttribute("width", canvasWidth); // 设置canvas宽度
	canvas.setAttribute("height", canvasHeight); // 设置canvas高度

	var gameTimer; // 游戏定时器，主循环

	var game; // 创建游戏对象
	var board; // 创建球板对象
	var bricks; // 创建砖块配置对象
	var ball; // 创建小球对象
	
	/* 移动静止状态的球 */
	var moveStopBall = function(speed) {
		if (board.checkBoardPosition(speed) == 1) {
			context.clearRect(0, 0, canvasWidth, canvasHeight);
			bricks.drawBrick(game);
			ball.moveBallPositionX(speed);
			ball.drawBall(ball.ballPositionX, ball.ballPositionY, context);
		} else if (board.checkBoardPosition(speed) == -1) {
			context.clearRect(0, 0, canvasWidth, canvasHeight);
			bricks.drawBrick(game);
			ball.ballPositionX = board.boardWidth / 2;
			ball.drawBall(ball.ballPositionX, ball.ballPositionY, context);
		} else {
			context.clearRect(0, 0, canvasWidth, canvasHeight);
			bricks.drawBrick(game);
			ball.ballPositionX = canvasWidth - board.boardWidth / 2;
			ball.drawBall(ball.ballPositionX, ball.ballPositionY, context);
		}
	};

	/* 移动运动状态的球 */
	var moveBall = function() {
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		bricks.drawBrick(game);
		board.drawBoard(board.boardPositionX, board.boardPositionY);
		ball.drawBall(ball.ballPositionX, ball.ballPositionY, context);
		ball.moveBallPositionX(ball.ballSpeedX);
		ball.moveBallPositionY(-ball.ballSpeedY);
	};

	/* 检测小球位置 */
	var checkBallPosition = function() { 
		if (ball.ballPositionX > canvasWidth - ball.ballRadius || ball.ballPositionX < ball.ballRadius) {
			ball.ballSpeedX = -ball.ballSpeedX;
		}
		if (ball.ballPositionY < ball.ballRadius) {
			ball.ballSpeedY = -ball.ballSpeedY;
		}
		if (ball.ballPositionY > canvasHeight - ball.ballRadius) {
			cancelAnimationFrame(gameTimer);

			game.gameLife = game.gameLife - 1;
			game.setGameLife(game.gameLife);

			// 重置游戏状态
			game.gameStart = true;

			context.clearRect(0, 0, canvasWidth, canvasHeight);
			ball.ballPositionX = 320; // 小球位置X坐标
			ball.ballPositionY = 420; // 小球位置Y坐标
			board.boardPositionX = canvasWidth/2 - board.boardWidth/2; // 球板位置X坐标
			board.boardPositionY = canvasHeight - 40 - board.boardHeigth; // 球板位置Y坐标

			// 重绘
			bricks.drawBrick(game);
			board.drawBoard(board.boardPositionX, board.boardPositionY);
			ball.drawBall(ball.ballPositionX, ball.ballPositionY, context);

			if (game.gameLife == 0) {
				// cancelAnimationFrame(gameTimer);
				alert("你输了！你的得分是"+game.gameScore+"分！");
		    	document.location.reload();
			}
		}
	};

	/* 游戏主循环 */
	var gameLoop = function() {
		gameTimer = requestAnimationFrame(gameLoop);

		moveBall();
	   	checkBallPosition();

	    var config = bricks.bricksConfig[game.gameLevel - 1];

		for (var i = 0; i < config.length; i++) {
			if (ball.checkBallCollide(config[i].brickPositionX, config[i].brickPositionY, config[i].brickWidth, config[i].brickHeight)) {
	    		config[i].brickLevel = config[i].brickLevel - 1;

	    		if (config[i].brickLevel == 0) {
		    		config.splice(i, 1);
		    		bricks.brickColors.splice(i, 1);
		    		game.gameScore = game.gameScore + 100;
		    		game.setGameScore(game.gameScore);
	    		} else {
	    			bricks.brickColors[i] = 'rgb('+bricks.getRandNum(255)+','+bricks.getRandNum(255)+','+bricks.getRandNum(255)+')';
	    		}

	    		if (config.length == 0) {
	    			cancelAnimationFrame(gameTimer);
					alert("你赢了！你的得分是"+game.gameScore+"分！");
			    	document.location.reload();
	    		}
	    		break;
	    	}
		}

		//如果小球底部Y坐标小于球板底部坐标再进行碰撞判断 
		//处理小球因为处于球板内部而重复检测发生抖动的bug
		if (ball.ballPositionY + ball.ballRadius < board.boardPositionY + board.boardHeigth) {
	    	ball.checkBallCollide(board.boardPositionX, board.boardPositionY, board.boardWidth, board.boardHeigth);
		}
	};

	/* canvas点击事件 */
	canvas.onclick = function() {
		if (game.gameStart) {
			game.gameStart = false; //防止重复触发点击事件

		 	// 游戏主循环
		 	gameLoop();
		}
	};

	/* 监听键盘事件 */
	document.addEventListener("keydown", function(event) {
		var e = event || window.event;

		// 按下向左键
		if (e.keyCode === 37) {
			if (game.gameStart) {
				moveStopBall(-board.boardSpeed);
			}
			board.moveBoard(-board.boardSpeed);
		}

		// 按下向右键
		if (e.keyCode === 39) {
			if (game.gameStart) {
				moveStopBall(board.boardSpeed);
			}
			board.moveBoard(board.boardSpeed);
		}
	}, false);

	/* 监听鼠标移动事件 */
	canvas.addEventListener("mousemove", function (e) {
		var relativeX = e.clientX - canvas.getBoundingClientRect().left;
	    if(relativeX > board.boardWidth / 2 && relativeX < canvas.width - board.boardWidth / 2) {
			if (game.gameStart) {
				context.clearRect(0, 0, canvasWidth, canvasHeight);
				bricks.drawBrick(game);
				ball.ballPositionX = relativeX;
				ball.drawBall(ball.ballPositionX, ball.ballPositionY, context);
			}

			board.boardPositionX = relativeX - board.boardWidth / 2;
			board.drawBoard(board.boardPositionX, board.boardPositionY);
		}
	}, false);

	// 游戏初始化
	var gameInit = function() {
		game = new Game(true, 0, 3, 1);
		board = new Board(280, 430);
		bricks = new Bricks();
		ball = new Ball(320, 420);

		bricks.initBrickColors();
		bricks.drawBrick(game);
		board.drawBoard(board.boardPositionX, board.boardPositionY);
		ball.drawBall(ball.ballPositionX, ball.ballPositionY, context);
		game.setGameScore(game.gameScore);
		game.setGameLife(game.gameLife);
	};

	gameInit();
}());