var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var playerCanvas = document.getElementById("playerCanvas");
var playerCtx = playerCanvas.getContext("2d");

var LANES_COUNT = 5;
var LANE_WIDTH = canvas.width / LANES_COUNT;
var EMPTY_LANES_WEIGHT = 1;
var TIME_BETWEEN_WAVES = 4000;
var TRAFFIC_MOVE_STEP = 4;
var HOLE_POINTS = 50;

var paused = false;
var rightPressed = false;
var leftPressed = false;
var leftAllowed = true;
var rightAllowed = true;
var score = 0;
var bestScore = 0;
var waveSpeed = 1;
var wavesInterval = null;
var explosion = new Image();
var crashed = false;
var oilOrHole = false;

var car = {name: "car", img: new Image(), imgFile: "img/car.png", height:0, width:0, lane:1, posX: 0, posY: 0};

var trafficPossibilities = [
    {name: "bus", img: new Image(), imgFile: "img/bus.png", height:0, width:0, lane:1, posX: 0, posY: 0},
    {name: "pickup", img: new Image(), imgFile: "img/pickup.png", height:0, width:0, lane:1, posX: 0, posY: 0},
    {name: "motorcycle", img: new Image(), imgFile: "img/motorcycle.png", height:0, width:0, lane:1, posX: 0, posY: 0},
    {name: "hole", img: new Image(), imgFile: "img/hole.png", height:0, width:0, lane:1, posX: 0, posY: 0},
    {name: "oil", img: new Image(), imgFile: "img/oil.png", height:0, width:0, lane:1, posX: 0, posY: 0}
];

function loadCar() {
    car.img.onload = function() { playerCtx.drawImage(car.img, playerCanvas.width / 2.0, (playerCanvas.height / 3.0)); };
    car.img.src = car.imgFile;

    car.width = car.img.width;
    car.height = car.img.height;
    car.lane = Math.ceil(LANES_COUNT / 2);
    car.posX = (LANE_WIDTH * car.lane) - (LANE_WIDTH / 2) - (car.width / 2);
    car.posY = (playerCanvas.height / 3.0) * 2 - (car.height / 2.0);
    car.zIndex = 5;
}

function loadExplosion() {
    explosion.onload = function() { playerCtx.drawImage(explosion, playerCanvas.width / 2, -200); };
    explosion.src = "img/explosion.png";
    playerCtx.drawImage(explosion, playerCanvas.width / 2, -200);
}

var currentWave = [];
function generateWave() {
    currentWave = [];
    for (var i = 0; i < LANES_COUNT; i++) {
        var index = Math.ceil(Math.random() * (trafficPossibilities.length) - 1);
        console.log("Index: " + index + " | trafficPossibilities.length: " + trafficPossibilities.length);
        if (index < trafficPossibilities.length) {
            currentWave.push(trafficPossibilities[index]);
            // console.log("Pushing " + trafficPossibilities[index].name + " | ImgFile: " + trafficPossibilities[index].imgFile);
        } else {
            currentWave.push(null);
            // console.log("Pushing null");
        }
    };

    for(var i = 0; i < currentWave.length; i++) {
        if (currentWave[i] != null && currentWave[i] !== undefined) {
            currentWave[i].lane = i + 1;
            currentWave[i].img.onload = function() {
                ctx.drawImage(currentWave[i].img, (LANE_WIDTH * currentWave[i].lane) - (LANE_WIDTH / 2) - (carImg.width / 2), 0)
            };
            currentWave[i].img.src = currentWave[i].imgFile;
            currentWave[i].width = currentWave[i].img.width;
            currentWave[i].height = currentWave[i].img.height;
            currentWave[i].posX = (LANE_WIDTH * currentWave[i].lane) - (LANE_WIDTH / 2) - (currentWave[i].width / 2);
            currentWave[i].posY = -200; //-currentWave[i].height;
            console.log("Vehicle: " + currentWave[i].name + ". PosX: " + currentWave[i].posX + " | PosY: " + currentWave[i].posY);
        }
    }
}

function startWaves() {
    wavesInterval = setInterval("generateWave()", TIME_BETWEEN_WAVES);
}

function collisionDetection() {
    for(i = 0; i < currentWave.length; i++) {
        var obstacle = currentWave[i];
        if (obstacle.lane == car.lane) {
            if (obstacle.posY + obstacle.height > car.posY && obstacle.posY <= car.posY + car.height) {
                if (obstacle.name == "oil") {
                    if (!oilOrHole) {
                        oilOrHole = true;
                        setTimeout("resetOilOrHole()", 1200);
                        if (car.lane == 1) { car.lane = 2; }
                        else if (car.lane == LANES_COUNT) { car.lane = LANES_COUNT - 1; }
                        else {
                            var slipLane = Math.floor(Math.random() * 10);
                            if (slipLane % 2 == 0) { car.lane += 1; }
                            else { car.lane -= 1; }
                        }
                    }
                } else if (obstacle.name == "hole") {
                    if (!oilOrHole) {
                        oilOrHole = true;
                        setTimeout("resetOilOrHole()", 1200);
                        if (score - HOLE_POINTS >= 0) { score -= HOLE_POINTS; }
                        else { score = 0; }
                    }
                } else if (!crashed) {
                    crashed = true;
                    var popup = document.getElementById("feedback");
                    pauseGame();
                    playerCtx.drawImage(explosion, car.posX + (car.width / 2.0) - (explosion.width / 2), car.posY + (car.height / 2.0) - (explosion.height / 2));                    
                    setTimeout("displayScore()", 1000);
                }
            }
        }
    }
}

function resetOilOrHole() {
    oilOrHole = false;
}

function displayScore() {
    alert("YOU CRASHED! Your score was " + Math.floor(score) + " and your best score is " + Math.floor(bestScore) + ".");
    setTimeout("restartGame()", 500);
}

function pauseGame() {
    paused = true;
    clearInterval(wavesInterval);
}

function unpauseGame() {
    paused = false;
    wavesInterval = setInterval("generateWave()", TIME_BETWEEN_WAVES);
}

function restartGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    playerCtx.clearRect(0, 0, canvas.width, canvas.height);
    unpauseGame();
    score = 0;
    currentWave = [];
    crashed = false;
    waveSpeed = 1;
    draw();
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Score: " + Math.floor(score), 10, 20);

    ctx.font = "16px Arial";
    ctx.fontWeight = "bold";
    ctx.fillStyle = "#33AAFF";
    ctx.fillText("Best Score: " + Math.floor(bestScore), canvas.width - 155, 20);
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = false;
    }
    else if(e.keyCode == 37) {
        leftPressed = false;
    }
}
function keyUpHandler(e) {
    if(e.keyCode == 39) {
        if (car.lane + 1 <= LANES_COUNT)
            {car.lane += 1;}
    }
    else if(e.keyCode == 37) {
        if (car.lane - 1 > 0)
            {car.lane -= 1;}
    }
}

function draw() {
    if (paused == false) {
        car.width = parseFloat(car.img.width);
        car.height = parseFloat(car.img.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        playerCtx.clearRect(0, 0, playerCanvas.width, playerCanvas.height);
        car.posX = (LANE_WIDTH * car.lane) - (LANE_WIDTH / 2) - (car.width / 2);
        playerCtx.drawImage(car.img, car.posX, car.posY);

        for(var i = 0; i < currentWave.length; i++) {
            if (currentWave[i] != null) {
                currentWave[i].width = parseFloat(currentWave[i].img.width);
                currentWave[i].height = parseFloat(currentWave[i].img.height);
                currentWave[i].posX = (LANE_WIDTH * currentWave[i].lane) - (LANE_WIDTH / 2) - (currentWave[i].width / 2);
                currentWave[i].posY += TRAFFIC_MOVE_STEP * waveSpeed;
                ctx.drawImage(currentWave[i].img, currentWave[i].posX, currentWave[i].posY);
            }
        }

        score += 0.25;

        if (score > bestScore) {
            bestScore = score;
        }

        if (score >= 300 && score < 600) {
            waveSpeed = 1.25;
        } else if (score >= 600 && score < 900) {
            waveSpeed = 1.5;
        } else if (score >= 900) {
            waveSpeed = 1.75;
        }

        drawScore();
        collisionDetection();
        requestAnimationFrame(draw);
    }
}

loadCar();
loadExplosion();
draw();
setTimeout("startWaves()", 500);
