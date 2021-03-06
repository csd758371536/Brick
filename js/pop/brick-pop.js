/* 程序基本配置 */
var canvas; // 画布元素
var context; // context对象
var canvasWidth = 640; // 定义画布宽度
var canvasHeight = 480; // 定义画布高度
var gameStart = true; // 游戏是否开始
var gameTimer; // 游戏定时器，主循环
var gameScore = 0; // 游戏得分
var gameLife = 3; // 游戏生命条数
/* 小球属性 */
var ballRadius = 10; // 小球半径
var ballSpeed = 4; // 小球速度
var ballColor = "#eee"; // 小球颜色
var ballSpeedX = ballSpeed; // 小球X方向的速度
var ballSpeedY = ballSpeed; // 小球Y方向的速度
var ballPositionX = 320; // 小球位置X坐标
var ballPositionY = 420; // 小球位置Y坐标
/* 球板属性 */
var boardWidth = 80; // 球板宽度
var boardHeigth = 10; // 球板高度
var boardSpeed = 40; // 球板速度
var boardPositionX = canvasWidth/2 - boardWidth/2; // 球板位置X坐标
var boardPositionY = canvasHeight - 40 - boardHeigth; // 球板位置Y坐标
var boardColor = "#000"; // 球板颜色
/* 砖块属性 */
var brickWidth = 40; // 砖块宽度
var brickHeight = 20; // 砖块高度

/* 页面加载完成后执行此方法 */
/* 本程序的入口函数 */
window.onload = function () {
	// 获得canvas元素
	canvas = document.getElementById("canvas");
	// 获得context对象
	context = canvas.getContext("2d");
	// 设置canvas尺寸
	canvas.setAttribute("width", canvasWidth);
	canvas.setAttribute("height", canvasHeight);

	// 初始化游戏
	initGame();
	// 初始化游戏分数
	document.getElementById("score").innerHTML = gameScore;
	// 初始化游戏生命
	document.getElementById("life").innerHTML = gameLife;

	// 绑定canvas点击事件
	canvas.onclick = function() {
		if (gameStart) {
			gameStart = false;

		 // gameTimer = setInterval(function(){
		 //        gameLoop(context);
		 //    }, 10);

		 	// 游戏主循环
		 	gameLoop();
		}
	};

	// 监听键盘事件
	document.addEventListener("keydown", function(event) {
		var e = event || window.event;

		// 按下向左键
		if (e.keyCode === 37) {
			if (gameStart) {
				moveStopBall(-boardSpeed);
			}
			moveBoard(-boardSpeed);
		}

		// 按下向右键
		if (e.keyCode === 39) {
			if (gameStart) {
				moveStopBall(boardSpeed);
			}
			moveBoard(boardSpeed);
		}
	}, false);

	// 监听鼠标移动事件
	document.addEventListener("mousemove", function (e) {
		var relativeX = e.clientX - canvas.getBoundingClientRect().left;
	    if(relativeX > boardWidth / 2 && relativeX < canvas.width - boardWidth / 2) {
			if (gameStart) {
				context.clearRect(0, 0, canvasWidth, canvasHeight);
				initBricks();
				ballPositionX = relativeX;
				drawBall(ballPositionX, ballPositionY);
			}

			boardPositionX = relativeX - boardWidth / 2;
			drawBoard(boardPositionX, boardPositionY);
	    }
	}, false);
};

/* 游戏主循环 */
function gameLoop() {
    gameTimer = requestAnimationFrame(gameLoop);

	moveBall();
    checkBallPosition();
    for (var i = 0; i < bricks.length; i++) {
    	if (checkBallCollide(bricks[i].brickPositionX, bricks[i].brickPositionY, brickWidth, brickHeight)) {
    		bricks.splice(i, 1);
    		gameScore = gameScore + 100;
    		document.getElementById("score").innerHTML = gameScore;

    		if (bricks.length == 0) {
    			cancelAnimationFrame(gameTimer);
				alert("你赢了！你的得分是"+gameScore+"分！");
		    	document.location.reload();
    		}
    		break;
    	}
    }
    checkBallCollide(boardPositionX, boardPositionY, boardWidth, boardHeigth);
}

/* 移动静止的球 */
function moveStopBall(speed) {
	if (boardPositionX + speed < 0 || boardPositionX + speed > canvasWidth - boardWidth) {
		return;
	}
	context.clearRect(0, 0, canvasWidth, canvasHeight);
	initBricks();

	ballPositionX = ballPositionX + speed;
	drawBall(ballPositionX, ballPositionY);
}

/* 移动球板 */
function moveBoard(speed) {
	if (boardPositionX + speed < 0 || boardPositionX + speed > canvasWidth - boardWidth) {
		return;
	}
	boardPositionX = boardPositionX + speed;
	drawBoard(boardPositionX, boardPositionY);
}

/* 移动运动的球 */
function moveBall() {
	// 清除画布内容
	context.clearRect(0, 0, canvasWidth, canvasHeight);
	for (var i = 0; i < bricks.length; i++) {
		drawBrick(bricks[i].brickPositionX, bricks[i].brickPositionY, bricks[i].brickColor);
	}
	drawBoard(boardPositionX, boardPositionY);
	drawBall(ballPositionX, ballPositionY);
	ballPositionX = ballPositionX + ballSpeedX;
	ballPositionY = ballPositionY - ballSpeedY;
}

/* 检测球位置 */
function checkBallPosition() {
	if (ballPositionX > canvasWidth - ballRadius || ballPositionX < ballRadius) {
		ballSpeedX = -ballSpeedX;
	}
	if (ballPositionY < ballRadius) {
		ballSpeedY = -ballSpeedY;
	}
	if (ballPositionY > canvasHeight - ballRadius) {
		cancelAnimationFrame(gameTimer);

		gameLife = gameLife - 1;
		document.getElementById("life").innerHTML = gameLife;

		gameStart = true;

		context.clearRect(0, 0, canvasWidth, canvasHeight);
		ballPositionX = 320; // 小球位置X坐标
		ballPositionY = 420; // 小球位置Y坐标
		boardPositionX = canvasWidth/2 - boardWidth/2; // 球板位置X坐标
		boardPositionY = canvasHeight - 40 - boardHeigth; // 球板位置Y坐标

		initBricks();
		//初始化球板位置
		initBoard();
		//初始化小球位置
		initBall();

		if (gameLife == 0) {
			// cancelAnimationFrame(gameTimer);
			alert("你输了！你的得分是"+gameScore+"分！");
	    	document.location.reload();
		}
	}
}

/* 检测球是否碰撞 */
/* 算法暂时存在bug，计算最小分离量有误，待优化 */
function checkBallCollide(x, y, width, height) {
	var ballX = ballPositionX - (x + width / 2);
	var ballY = (y + height / 2) - ballPositionY;

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

	if (uX*uX + uY*uY < ballRadius*ballRadius) {
		var a1 = y + height / 2 - ballPositionY;
		var b1 = x + width / 2 - ballPositionX;

		if (a1 > 0) {
			if (b1 > 0) {
				ballPositionX = ballPositionX - ballRadius/8;
				ballPositionY = ballPositionY - ballRadius/8;
			} else {
				ballPositionX = ballPositionX + ballRadius/8;
				ballPositionY = ballPositionY - ballRadius/8;
			}
		} else {
			if (b1 > 0) {
				ballPositionX = ballPositionX - ballRadius/8;
				ballPositionY = ballPositionY + ballRadius/8;
			} else {
				ballPositionX = ballPositionX + ballRadius/8;
				ballPositionY = ballPositionY + ballRadius/8;
			}
		}

		if (a1 < 0) {
			a1 = ballPositionY - (y + height / 2);
		}

		if (b1 < 0) {	
			b1 = ballPositionX - (x + width / 2);
		}

		if (a1 / b1 > height / width) {
			ballSpeedY = -ballSpeedY;
			return true;
		} else if (a1 / b1 < height / width) {
			ballSpeedX = -ballSpeedX;
			return true;
		} else {
			ballSpeedX = -ballSpeedX;
			ballSpeedY = -ballSpeedY;
			return true;
		}
	}

	return false;
}

/* 初始化游戏 */
function initGame() {
	initBricks();
	initBoard();
	initBall();
}

/* 初始化砖块位置 */
function initBricks() {
	for (var i = 0; i < bricks.length; i++) {
		drawBrick(bricks[i].brickPositionX, bricks[i].brickPositionY, bricks[i].brickColor);
	}
}

/* 初始化球板位置 */
function initBoard() {
	drawBoard(boardPositionX, boardPositionY);
}

/* 初始化小球位置 */
function initBall() {
	drawBall(ballPositionX, ballPositionY);
}

/* 绘制砖块 */
function drawBrick(x, y, brickColor) {
	context.beginPath();
    context.fillStyle = brickColor;
    context.fillRect(x, y, brickWidth, brickHeight);
    context.closePath();
}

/* 绘制球板 */
function drawBoard(x, y) {
	context.beginPath();
    context.fillStyle = boardColor;
    context.fillRect(x, y, boardWidth, boardHeigth);
    context.closePath();
}

/* 绘制小球 */
function drawBall(x, y) {
    context.beginPath();
    context.arc(x, y, ballRadius, 0, Math.PI * 2, true);
    context.fillStyle = ballColor;
    context.fill();
    context.closePath();
}
