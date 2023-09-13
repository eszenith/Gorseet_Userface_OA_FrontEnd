"use strict";

let MainLoopIntervalId = 0;

let screenStartCol = Math.ceil(displayWidth / 2);
let startCoord = [0, screenStartCol];

let currentBlock = blocks.I;
let start = true;
let startTime;
let gameSpeed = 100;
let old_gameSpeed = gameSpeed + 1;
let changeSpeedW = false;

const spanTimeSeconds = document.querySelector(".time-s");;
const spanTimeMinutes = document.querySelector(".time-m");;

const restartButton = document.querySelector(".button-restart");


const leftButton = document.querySelector(".button-left");
const downButton = document.querySelector(".button-down");
const rightButton = document.querySelector(".button-right");
const hintButton = document.querySelector(".button-hint");

// for checking sample line cleared or not other wise blocks are randomly generated
let sample_words = [5,6,7,8,2];
let sample_index = 0;

let randomProperty = function (obj) {
    // check sample phrase
    if(sample_index < sample_words.length && sample_index == 0) {
        let val= [obj[sample_words[sample_index]], obj[sample_words[sample_index+1]]];
        sample_index+=2;
        return val;
    }
    else if (sample_index < sample_words.length){
        console.log("smapl : "+sample_index);
        let val = [obj[sample_words[sample_index]]];
        sample_index +=1;
        return val;
    }

    //generate randomly

    let keys = Object.keys(obj);
    let generatedIndex = keys.length * Math.random() << 0;
    let generatedIndex2 = keys.length * Math.random() << 0
    //console.log("---- key selected : " + keys[generatedIndex]);
    return [obj[keys[generatedIndex]], obj[keys[generatedIndex2]]];
};


// For user input
let someKeyIsDown = 0;
let keyDownDict = {};

// Event handlers -------------------------------------
restartButton.addEventListener("click", function (e) {
    e.preventDefault();
    restartGame();
})
// Store current key down
document.addEventListener('keydown', function (event) {

    //console.log("some key pressed" + Object.keys(keyDownDict).length);

    if (Object.keys(keyDownDict).length === 0) {
        //check: convert array search to hashmap
        if (event.code == "KeyQ") {
            someKeyIsDown = "Q";

        }
        if (event.code == "KeyE") {
            someKeyIsDown = "E";

        }
        if (event.code == "KeyW") {
            someKeyIsDown = "W";

        }


    }
});

document.addEventListener("click", function(e) {
    e.preventDefault();
    const hintEl = document.querySelector(".hint");
    if(hintEl.innerHTML === "") {
        hintEl.innerHTML = " | Hint : Make phrases from block like : That run the world and";
    }
    else {
        hintEl.innerHTML = "";
    }
})
document.addEventListener('keyup', function (event) {
    if (event.code in keyDownDict) {
        delete keyDownDict[event.code];
    }

    if (someKeyIsDown === "W") {
        //console.log("chaned "+old_gameSpeed+ " " + gameSpeed);
        gameSpeed = 100;
        changeSpeedW = false;

        setIntervalForGame(gameSpeed);
    }

    if (Object.keys(keyDownDict).length === 0) {
        someKeyIsDown = 0;
    }

});


leftButton.addEventListener("mousedown", function (e) {
    e.preventDefault();
    someKeyIsDown = 'Q';
});
downButton.addEventListener("mousedown", function (e) {
    e.preventDefault();
    someKeyIsDown = 'W';
});
rightButton.addEventListener("mousedown", function (e) {
    e.preventDefault();
    someKeyIsDown = 'E';
});

function releaseButton(e) {
    e.preventDefault();
    someKeyIsDown = "";
}

leftButton.addEventListener("mouseup", releaseButton);

downButton.addEventListener("mouseup", function (e) {
    someKeyIsDown = "";
    gameSpeed = 100;
    changeSpeedW = false;

    setIntervalForGame(gameSpeed);
});
rightButton.addEventListener("mouseup", releaseButton);

//--------------------------------------
let mobileFlag = 0;
function setMobileButtons() {

    function setButton(button) {
        button.style.display = "inline";

    }
    function unsetButton(button) {
        button.style.display = "none";
    }

    if (gameContainer.clientWidth > 800) {
        unsetButton(leftButton);
        unsetButton(rightButton);
        unsetButton(downButton);
    }
    else if(!mobileFlag){
        mobileFlag = 1;
        setButton(leftButton);
        setButton(rightButton);
        setButton(downButton);
        setGameSize();
        restartGame();

    }
}

function convertTime(date) {
    date = date - startTime;
    date = date / 1000;
    //console.log("date" + new Date().getTime());
    const minutes = Math.floor(date / 60);
    const seconds = date - minutes * 60;
    spanTimeSeconds.innerHTML = Math.round(seconds);
    spanTimeMinutes.innerHTML = minutes;
    if (minutes >= 5) {
        gameOverFlag = true;
    }
    return [minutes, seconds];
}



function toggleBlockInUse() {
    currentBlockInUse = !currentBlockInUse;
}
//for first time there is no next block
let nextBlock = null;
const nextBlockElement  = document.querySelector(".nextBlock");


function assignBlockAndRestart() {
    start = true;
    reInitBlocks();
    startCoord = [0, screenStartCol];

    if(nextBlock) {
        currentBlock = nextBlock;
        nextBlock = randomProperty(blocks)[0];
    }else {
        [currentBlock, nextBlock] = randomProperty(blocks);
    }
    toggleBlockInUse();
    nextBlockElement.innerHTML = nextBlock.value.join("");
}

function checkBlockInUse() {
    if (currentBlockInUse) {
        return;
    }
    assignBlockAndRestart();
}

function checkGameOver() {
    if (gameOverFlag) {
        //clearInterval(loopIntervalID);
        return true;
    }
    return false;
}

function gameCycle() {
    setMobileButtons();
    convertTime(new Date().getTime());

    if (gameSpeed >= 65) {
        gameSpeed = gameSpeed / 1.002;
    }
    //console.log(gameSpeed);

    setIntervalForGame(gameSpeed);
    if (checkGameOver()) {
        gameOver.innerHTML = "GAME OVER!!!";
        clearInterval(MainLoopIntervalId);
        return;
    }
    checkBlockInUse();

    if (currentBlockInUse) {
        //spawns a new block

        if (start) {
            try {
                moveBlock(currentBlock, startCoord[0], startCoord[1]);
            }
            catch (err) {
                debugger;
            }
            start = false;
        }

        try {
            if (currentBlock.coord[1] > 1) {
                if (someKeyIsDown === "Q") {
                    moveBlock(currentBlock, currentBlock.coord[0], currentBlock.coord[1] - 1);
                }
            }
            if (currentBlock.coord[1] < displayWidth - (currentBlock.rotations[0][0].length - 1)) {
                if (someKeyIsDown === "E") {
                    moveBlock(currentBlock, currentBlock.coord[0], currentBlock.coord[1] + 1);
                }
            }

            if (someKeyIsDown === "W" && !changeSpeedW) {
                old_gameSpeed = gameSpeed;
                gameSpeed = gameSpeed / 2;
                changeSpeedW = true;
                setIntervalForGame(gameSpeed);
            }
        }
        catch (err) {
            gameOverFlag = true;
        }
        moveBlock(currentBlock, startCoord[0], currentBlock.coord[1]);
    }
    startCoord[0] += 1;

}

//restarts the game changing all parameters
function restartGame(setInt = true) {
    
    screenStartCol = Math.ceil(displayWidth / 2);
    startCoord = [0, screenStartCol];
    startTime = new Date().getTime();
    convertTime(startTime);


    clearBoardBitMap();

    scoreSpan.innerHTML = "0";
    currentBlockInUse = false

    gameSpeed = 100;
    //clearInterval(loopIntervalID)
    gameOverFlag = false;

    if (setInt)
        setIntervalForGame(gameSpeed);
}

function setIntervalForGame(speed) {
    clearInterval(MainLoopIntervalId);
    MainLoopIntervalId = setInterval(() => {
        gameCycle();
    }, speed);
}

//starts the game
restartGame();