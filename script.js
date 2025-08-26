// 游戏常量
const GRID_SIZE = 20; // 网格大小
let GAME_SPEED = 150; // 游戏速度（毫秒），现在是变量而不是常量

// 获取DOM元素
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const restartButton = document.getElementById('restart-btn');
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const startScreen = document.getElementById('start-screen');
const startGameBtn = document.getElementById('start-game-btn');
const musicToggle = document.getElementById('music-toggle');
const volumeSlider = document.getElementById('volume-slider');
const volumeIcon = document.getElementById('volume-icon');

// 游戏状态
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameInterval;
let isPaused = false;
let isGameOver = false;
let isGameStarted = false;

// 背景音乐实例
const backgroundMusic = new BackgroundMusic();

// 初始化背景音乐
function initBackgroundMusic() {
    backgroundMusic.init();
    
    // 设置音乐开关事件监听
    musicToggle.addEventListener('change', function() {
        if (this.checked) {
            backgroundMusic.play();
        } else {
            backgroundMusic.pause();
        }
    });
    
    // 设置音量控制事件监听
    volumeSlider.addEventListener('input', function() {
        const volume = this.value / 100;
        backgroundMusic.setVolume(volume);
        
        // 更新音量图标
        updateVolumeIcon(volume);
    });
    
    // 初始化音量
    const initialVolume = volumeSlider.value / 100;
    backgroundMusic.setVolume(initialVolume);
    updateVolumeIcon(initialVolume);
}

// 更新音量图标
function updateVolumeIcon(volume) {
    if (volume === 0) {
        volumeIcon.textContent = '🔇';
    } else if (volume < 0.5) {
        volumeIcon.textContent = '🔉';
    } else {
        volumeIcon.textContent = '🔊';
    }
}

// 初始化游戏
function initGame() {
    // 初始化蛇
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];
    
    // 初始化方向
    direction = 'right';
    nextDirection = 'right';
    
    // 初始化分数
    score = 0;
    scoreElement.textContent = score;
    
    // 生成食物
    generateFood();
    
    // 重置游戏状态
    isPaused = false;
    isGameOver = false;
    isGameStarted = true;
    
    // 更新按钮状态
    startButton.textContent = '开始游戏';
    pauseButton.textContent = '暂停';
    
    // 绘制初始状态
    draw();
}

// 生成食物
function generateFood() {
    // 随机生成食物位置
    const gridWidth = canvas.width / GRID_SIZE;
    const gridHeight = canvas.height / GRID_SIZE;
    
    let newFood;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight)
        };
        
        // 确保食物不会生成在蛇身上
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = newFood;
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = '#f5f5f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格线
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
    ctx.lineWidth = 0.5;
    
    // 绘制垂直网格线
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平网格线
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        // 蛇头与身体使用不同颜色
        if (index === 0) {
            ctx.fillStyle = '#007AFF'; // 蛇头颜色 - 苹果蓝
        } else {
            ctx.fillStyle = '#5AC8FA'; // 蛇身颜色 - 浅蓝色
        }
        
        ctx.fillRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE - 1,
            GRID_SIZE - 1
        );
    });
    
    // 绘制食物
    ctx.fillStyle = '#FF3B30'; // 苹果红色
    ctx.fillRect(
        food.x * GRID_SIZE,
        food.y * GRID_SIZE,
        GRID_SIZE - 1,
        GRID_SIZE - 1
    );
    
    // 如果游戏结束，显示游戏结束文字
    if (isGameOver) {
        // 半透明背景
        ctx.fillStyle = 'rgba(245, 245, 247, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 游戏结束标题
        ctx.font = '600 30px -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", sans-serif';
        ctx.fillStyle = '#1d1d1f';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 25);
        
        // 分数
        ctx.font = '500 20px -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", sans-serif';
        ctx.fillStyle = '#007AFF';
        ctx.fillText(`最终得分: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
        
        // 提示文字
        ctx.font = '400 16px -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", sans-serif';
        ctx.fillStyle = '#86868b';
        ctx.fillText('按"重新开始"按钮再来一局', canvas.width / 2, canvas.height / 2 + 45);
    }
}

// 移动蛇
function moveSnake() {
    // 如果游戏暂停或结束，不移动
    if (isPaused || isGameOver) return;
    
    // 更新方向
    direction = nextDirection;
    
    // 获取蛇头
    const head = { ...snake[0] };
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 检查碰撞
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    // 将新蛇头添加到蛇身前面
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        scoreElement.textContent = score;
        
        // 生成新食物
        generateFood();
    } else {
        // 如果没有吃到食物，移除蛇尾
        snake.pop();
    }
    
    // 重新绘制游戏
    draw();
}

// 检查碰撞
function checkCollision(head) {
    // 检查是否撞墙
    const gridWidth = canvas.width / GRID_SIZE;
    const gridHeight = canvas.height / GRID_SIZE;
    
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= gridWidth ||
        head.y >= gridHeight
    ) {
        return true;
    }
    
    // 检查是否撞到自己（从第二个身体段开始检查）
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    isGameStarted = false;
    clearInterval(gameInterval);
    draw();
}

// 隐藏开始界面
function hideStartScreen() {
    startScreen.style.opacity = '0';
    setTimeout(() => {
        startScreen.style.display = 'none';
    }, 500);
}

// 显示开始界面
function showStartScreen() {
    startScreen.style.display = 'flex';
    setTimeout(() => {
        startScreen.style.opacity = '1';
    }, 10);
}

// 开始游戏
function startGame() {
    if (!isGameStarted) {
        hideStartScreen();
        initGame();
        // 使用当前设置的游戏速度
        updateGameSpeed();
        gameInterval = setInterval(moveSnake, GAME_SPEED);
        
        // 如果音乐开关打开，开始播放背景音乐
        if (musicToggle.checked) {
            backgroundMusic.play();
        }
    } else if (isPaused) {
        resumeGame();
    }
}

// 暂停游戏
function pauseGame() {
    if (!isGameStarted || isGameOver) return;
    
    if (isPaused) {
        resumeGame();
    } else {
        isPaused = true;
        clearInterval(gameInterval);
        pauseButton.textContent = '继续';
    }
}

// 恢复游戏
function resumeGame() {
    isPaused = false;
    // 使用当前设置的游戏速度
    updateGameSpeed();
    gameInterval = setInterval(moveSnake, GAME_SPEED);
    pauseButton.textContent = '暂停';
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameInterval);
    initGame();
    // 使用当前设置的游戏速度
    updateGameSpeed();
    gameInterval = setInterval(moveSnake, GAME_SPEED);
    hideStartScreen();
}

// 键盘事件处理
function handleKeydown(e) {
    // 如果游戏结束，不处理键盘事件
    if (isGameOver) return;
    
    // 根据按键更新方向
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
}

// 更新游戏速度
function updateGameSpeed() {
    const speedLevel = parseInt(speedSlider.value);
    let speedText = '';
    
    switch(speedLevel) {
        case 1:
            GAME_SPEED = 250; // 非常慢
            speedText = '非常慢';
            break;
        case 2:
            GAME_SPEED = 200; // 慢
            speedText = '慢';
            break;
        case 3:
            GAME_SPEED = 150; // 中等
            speedText = '中等';
            break;
        case 4:
            GAME_SPEED = 100; // 快
            speedText = '快';
            break;
        case 5:
            GAME_SPEED = 70; // 非常快
            speedText = '非常快';
            break;
    }
    
    speedValue.textContent = speedText;
    
    // 如果游戏正在运行，重新设置间隔
    if (isGameStarted && !isPaused && !isGameOver) {
        clearInterval(gameInterval);
        gameInterval = setInterval(moveSnake, GAME_SPEED);
    }
}

// 事件监听
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', pauseGame);
restartButton.addEventListener('click', restartGame);
document.addEventListener('keydown', handleKeydown);
speedSlider.addEventListener('input', updateGameSpeed);
startGameBtn.addEventListener('click', startGame);

// 初始化背景音乐
initBackgroundMusic();

// 初始化速度值
updateGameSpeed();

// 添加CSS过渡效果
startScreen.style.transition = 'opacity 0.5s ease';

// 初始绘制
draw();

// 显示开始界面
showStartScreen();