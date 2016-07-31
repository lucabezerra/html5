var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var rightPressed = false;
var leftPressed = false;
var leftAllowed = true;
var rightAllowed = true;
var score = 0;
var lives = 3;
var waveSpeed = 1;
var LANES_COUNT = 5;
var LANE_WIDTH = canvas.width / LANES_COUNT;
var EMPTY_LANES_WEIGHT = 1;
var carImg = new Image();
carImg.onload = function() { ctx.drawImage(carImg, canvas.width / 2, (canvas.height / 3)); };
carImg.src = "img/car.png";

var carWidth = carImg.width;
var carHeight = carImg.height;
var currentLane = Math.ceil(LANES_COUNT / 2);
var carX = (LANE_WIDTH * currentLane) - (LANE_WIDTH / 2) - (carImg.width / 2);
var carY = (canvas.height / 3.0) * 2 - (carImg.height / 2.0);

var trafficPossibilities = [
    {name: "bus", img: new Image(), imgFile: "img/bus.png", height:0, width:0, lane:1, posX: 0, posY: 0},
    {name: "pickup", img: new Image(), imgFile: "img/pickup.png", height:0, width:0, lane:1, posX: 0, posY: 0},
    {name: "motorcycle", img: new Image(), imgFile: "img/motorcycle.png", height:0, width:0, lane:1, posX: 0, posY: 0}
];

var currentWave = [];

for (var i = 0; i < LANES_COUNT; i++) {
    var index = Math.ceil(Math.random() * (trafficPossibilities.length) - 1);
    console.log("Index: " + index + " | trafficPossibilities.length: " + trafficPossibilities.length);
    if (index < trafficPossibilities.length) {
        currentWave.push(trafficPossibilities[index]);

        console.log("Pushing " + trafficPossibilities[index].name + " | ImgFile: " + trafficPossibilities[index].imgFile);
    } else {
        currentWave.push(null);
        console.log("Pushing null");
    }
};

// function loadWave() {
    for(var i = 0; i < currentWave.length; i++) {
        if (currentWave[i] != null && currentWave[i] !== undefined) {
            console.log(currentWave[i]);
            currentWave[i].lane = i + 1;
            currentWave[i].img.onload = function() { ctx.drawImage(currentWave[i].img, (LANE_WIDTH * currentWave[i].lane) - (LANE_WIDTH / 2) - (carImg.width / 2), 0)};
            currentWave[i].img.src = currentWave[i].imgFile;
            currentWave[i].width = currentWave[i].img.width;
            currentWave[i].height = currentWave[i].img.height;
            currentWave[i].posX = (LANE_WIDTH * currentWave[i].lane) - (LANE_WIDTH / 2) - (currentWave[i].width / 2);
            currentWave[i].posY = -currentWave[i].height;
            console.log("Vehicle: " + currentWave[i].name + ". PosX: " + currentWave[i].posX + " | PosY: " + currentWave[i].posY);
        }
    }
//}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
// document.addEventListener("mousemove", mouseMoveHandler, false);

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
        if (currentLane + 1 <= LANES_COUNT)
            {currentLane += 1;}
        console.log("right");
    }
    else if(e.keyCode == 37) {
        if (currentLane - 1 > 0)
            {currentLane -= 1;}
        console.log("left");
    }
}
// function mouseMoveHandler(e) {
//     var relativeX = e.clientX - canvas.offsetLeft;
//     if(relativeX > 0 && relativeX < canvas.width) {
//         carX = relativeX - carImg.width/2;
//     }
// }
function collisionDetection() {
    for(i = 0; i < currentWave.length; i++) {
        if (currentWave[i].lane == currentLane) {
            var vehicleY = currentWave[i].posY;
            var vehicleLength = currentWave[i].height;
            if (vehicleY + vehicleLength > carY && vehicleY <= carY + carHeight) {
                console.log("CRASHED!");
                document.location.reload();
            }
        }
    }
}

function drawLanes() {
    for (var i = 0; i <= LANES_COUNT; i++) {
        ctx.setLineDash([70, 90]);
        ctx.beginPath();
        ctx.moveTo(LANE_WIDTH * i, 0);
        ctx.lineTo(LANE_WIDTH * i, canvas.height);
        ctx.stroke();
    }
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Score: "+score, 8, 20);
}
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Lives: "+lives, canvas.width-65, 20);
}

function draw() {
    var carWidth = parseFloat(carImg.width);
    var carHeight = parseFloat(carImg.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    carX = (LANE_WIDTH * currentLane) - (LANE_WIDTH / 2) - (carWidth / 2);
    ctx.drawImage(carImg, carX, carY);

    for(var i = 0; i < currentWave.length; i++) {
        if (currentWave[i] != null) {
            currentWave[i].width = parseFloat(currentWave[i].img.width);
            currentWave[i].height = parseFloat(currentWave[i].img.height);
            currentWave[i].posX = (LANE_WIDTH * currentWave[i].lane) - (LANE_WIDTH / 2) - (currentWave[i].width / 2);
            currentWave[i].posY += 4;
            ctx.drawImage(currentWave[i].img, currentWave[i].posX, currentWave[i].posY);
        }
    }

    drawScore();
    drawLives();
    collisionDetection();

    var collided = false;
    if (collided) {
        lives--;
        if(!lives) {
            console.log("Game over");
            document.location.reload();
        }
        else {
            carX = (canvas.width - carWidth)/2;
        }
    }
    requestAnimationFrame(draw);
}

draw();