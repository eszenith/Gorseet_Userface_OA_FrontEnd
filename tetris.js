blocks = {} 

//total score of user in game
let totalScore = 0;

//if user able to make line like given in array then line is cleared
let lineClearConditions = ["WEDESIGNANDDEVELOPAPPLICATIONS", "THATRUNTHEWORLDAND", "SHOWCASETHEFUTURE"];

//all words that can fall in game
let words = ["WE", "DESIGN", "AND", "DEVELOP", "APPPLICATIONS", "THAT", "RUN", "THE", "WORLD", "SHOWCASE", "FUTURE"];
//let words = ["APPLICATI"];
initBlocks(words);

//constructor for making a block object
function Block(word) {
    let arr = [];
    let arr2 = [];
    let val = [];
    for(let char of word) {
        arr2.push(1);
        val.push(char);
    }
    arr.push(arr2);

    this.coord = [-9999,-9999];             //coordinates of a block
    this.rotations = [];
    this.rotations.push(arr);
    this.value = val;

}

// initializes all bocks according to given word Array.
function initBlocks(wordArray) {
    let ind = 0;
    for(let word of wordArray) {

        blocks[ind] = new Block(word);
        ind+=1;
    }
    console.log(blocks);
}

// if player can use the current block this variable is true
let currentBlockInUse = true;

//DOM element which represents the score
const scoreSpan = document.querySelector(".score-span");

//reinitalizes block in object blocks whenever we need to spawn a new block in game
function reInitBlocks() {
    Object.keys(blocks).forEach(function(key) {
        blocks[key].coord = [-9999,-9999];
    });
}

// checks if block can move to next position -- collision detection
function checkBlockFeasable(block, row , col) {
    // we take previous block coordinates
    if(row == null && col == null) {
        row = block.coord[0];
        col = block.coord[1];
    }

    let startRow = row;
    let startPixelCol = col - 1;
    let startPixelRow = row;

    // if block in first row of display
    if(block.coord[0] === 0) {
        for (let i = 0;i<block.rotations[0].length;i++) {
            //checks if block before current block
            let colBeforeBlock = block.coord[1]-1;
            while(colBeforeBlock >= 0) {
                if(getPixel(i,colBeforeBlock) && bitMap[i][colBeforeBlock] === 1){
                    if(col <= colBeforeBlock){
                        return false;
                    }
                }
                colBeforeBlock--;
            }

        }
    }

    for (let blockRow of block.rotations[0]) {
        startPixelCol = col - 1;
        for (let pixel of blockRow) {
            if (pixel == 1) {
                if (getPixel(startPixelRow, startPixelCol)){
                    return false;
                }
                
                let startPixelRow_temp = startPixelRow-1;
                while(startPixelRow_temp > 0) {
                    if(getPixel(startPixelRow_temp, startPixelCol) && bitMap[startPixelRow_temp][startPixelCol] === 1) {
                        return false;
                    }
                    startPixelRow_temp--;
                }
            }
            startPixelCol += 1;
        }
        startPixelRow += 1;
    }
    return true;
}

//draws or clears a block , also set bits in bitMap
function drawClearBlock(block, row , col, setInGrid = false, draw = true){
    
    //if row col undefined then we need to clear the block or fix it in place
    if(row == null && col == null) {
        row = block.coord[0];
        col = block.coord[1];
    }
    else {
        //works if we found collision with grid then fix the block
        if(!checkBlockFeasable(block, row , col)){
            if(draw)
            {
                //scoreSpan.innerHTML = parseInt(scoreSpan.innerHTML)+1;

                drawClearBlock(block, null, null, true);
                currentBlockInUse = false;
                checkAndClearLine();
                
                for(let i = 0;i<topFilledRowInCol.length;i++) {
                    if(topFilledRowInCol[i] <= 1) {
                        gameOverFlag = true;
                    }
                }   
            }
            return false;
        }
    }
    let startPixelCol = col - 1;
    let startPixelRow = row;

    for (let row of block.rotations[0]) {
        startPixelCol = col - 1;
        // for printing text in grid
        let index_of_pixel = 0;
        for (let pixel of row) {
            if (pixel === 1) {
                if(setInGrid) {
                    setPixelOnGrid(startPixelRow,startPixelCol);
                }
                if(draw) {
                    togglePixel(startPixelRow, startPixelCol, block.class, block.value[index_of_pixel]);
                    index_of_pixel+=1
                }
            }
            startPixelCol += 1;
        }
        startPixelRow += 1;
    }
    return true;
}

//clears the previous drawn block and and draws new block in new position
function moveBlock(block, row, col) {

    //before drawing a pixel check if no block in way of drawing then do below code
    if(block.coord[0] != -9999 || block.coord[1] != -9999) {
        //clears previous drawn block
        drawClearBlock(block);
    }

    drawClearBlock(block,row,col);

    block.coord = [row , col];
}



function checkAndClearLine() {
    for(let i = 0;i<displayHeight;i++) {
        let stringRow = ""
        let clearLine = i;
        for(let j=0;j<displayWidth;j++) {
            if(elementMap[i][j].innerHTML === "")
                stringRow += "0";
            else{
                elementMap[i][j].classList.add("block-off");
                stringRow += elementMap[i][j].innerHTML;
            }
        }
        console.log("stringrow : "+stringRow);
        for(let line of lineClearConditions) {
            if(stringRow.includes(line)) {
                makeGridFallAbove(clearLine);
                //totalScore += 100;
                scoreSpan.innerHTML = parseInt(scoreSpan.innerHTML)+100;
            }
        }
        
    }
}

