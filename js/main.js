
var gBoard
var gLevel = {
    SIZE: 4,
    MINES: 3
}

var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    lives: 3,
    hint:3
}
var gStartTime = 0
var gIntervalID
var clickCount = 0

function initGame() {
    gBoard = buildBoard()
    renderBoard(gBoard)
}

function levelGame(elBtn) {
    if (elBtn.innerText === 'Easy(4x4)') {
        gLevel.SIZE = 4
        gLevel.MINES = 3
        resetTable()
        elBtn.style.color = '#dbd24a'
        initGame()
    }
    if (elBtn.innerText === 'Medium(8x8)') {
        gLevel.SIZE = 8
        gLevel.MINES = 12
        resetTable()
        elBtn.style.color = '#dbd24a'
        initGame()
    }
    if (elBtn.innerText === 'Hard(12x12)') {
        gLevel.SIZE = 12
        gLevel.MINES = 12
        resetTable()
        elBtn.style.color = '#dbd24a'
        initGame()
    }
}




function buildBoard() {
    var mat = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        mat[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            cell = {
                minesAroundCount: '',
                isShown: false,
                isMine: false,
                isMarked: false,
                isHinted: false
            }
            mat[i][j] = cell
        }
    }
    console.table(mat)
    return mat
}


function renderBoard(board) {
    var strHTML = ''
    var className
    var shownCell = []
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[i].length; j++) {
            var cell = gBoard[i][j]

            if (!cell.isShown) {
                className = 'hide'
                cell.minesAroundCount = ""
            }
            if (cell.isMine && cell.isShown && !cell.isMarked) {
                className = 'mine'
                cell.minesAroundCount = '💣'
            }
            if(cell.isHinted) className = 'hint'
            if (!cell.isMine && cell.isShown && !cell.isMarked) className = 'reg'
            if (cell.minesAroundCount === 0 && !cell.isMine && !cell.isMarked) cell.minesAroundCount = ''
            if (cell.isMarked) {
                cell.minesAroundCount = '🚩'
                className = 'hide'
            }

            if (cell.isShown && !cell.isMine) {
                shownCell.push(cell)
                gGame.shownCount = shownCell.length
                console.log(shownCell.length)
            }
            strHTML += `<td class ="cell-${i}-${j} ${className}"oncontextmenu="cellMarked(this, ${i},${j})" onclick="cellClicked(this, ${i},${j})">${cell.minesAroundCount}</td>`
        }

        strHTML += '</tr>'
    }
    var elCell = document.querySelector('.board-container')
    elCell.innerHTML = strHTML
    renderStats()
}




function setMinesNegsCount(clickI, clickJ) {
    var minesCount = 0
    while (minesCount !== gLevel.MINES) {
        var I = getRandomInt(0, gBoard.length)
        var J = getRandomInt(0, gBoard[0].length)
        if (gBoard[I][J].isMine) continue
        if (I === clickI && J === clickJ) continue
        gBoard[I][J].isMine = true
        minesCount++
    }


}



// CountNeighbors
function countMinesAround(mat, rowIdx, colIdx) {
    var minesCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > mat[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = mat[i][j]
            if (cell.isMine) {
                minesCount++
            }
        
        }
    }

    return minesCount
}

function expandShown(mat, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > mat[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = mat[i][j]
            cell.isShown = true
            cell.minesAroundCount = countMinesAround(mat, i, j)


        }
    }
}
///////////////////
function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    clickCount++
    var cell = gBoard[i][j]
    if (clickCount === 1) {
        setMinesNegsCount(i, j)
        startTimer()
    }
    if (cell.isMarked || cell.isShown) return
    cell.isShown = true
    if (cell.isShown && cell.isMine) {
        gGame.lives--

    }
    if (!cell.isMine) {
        mines = countMinesAround(gBoard, i, j)
        cell.minesAroundCount = mines
    }
    if (cell.minesAroundCount === 0) {
        expandShown(gBoard, i, j)
    }
    renderBoard(gBoard)
    checkGameOver()


}

function cellMarked(elCell, i, j) {
    window.oncontextmenu = (e) => {
        e.preventDefault();
    }
    if (!gGame.isOn) return
    var cell = gBoard[i][j]
    if (cell.isShown) return
    if (cell.isMarked) {
        cell.isMarked = false
        gGame.markedCount--
    }
    else {
        cell.isMarked = true
        gGame.markedCount++
    }
    renderBoard(gBoard)
}


function checkGameOver() {
    var elGameOver = document.querySelector('.game-over')
    var elSmile = document.querySelector('.smile')
    if (gGame.lives === 0) {
        gGame.isOn = false
        elGameOver.innerHTML = '<h2 style="color:brown">You Lost</h2>'
        elSmile.innerText = '😫'
        clearInterval(gIntervalID)

    }
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (gGame.shownCount === gLevel.SIZE * gLevel.SIZE - gLevel.MINES) {
                if (cell.isMine) cell.isMarked = true
                gGame.markedCount = gLevel.MINES
                elGameOver.innerHTML = '<h2 style="color:green">You win!</h2>'
                elSmile.innerText = '🤩'

                gGame.isOn = false
                clearInterval(gIntervalID)
                renderBoard(gBoard)
            }
        }

    }

}





function renderStats() {
    var elLives = document.querySelector('.lives')
    elLives.innerText = 'Lives: ' + gGame.lives
    var elShownCount = document.querySelector('.count')
    elShownCount.innerText = 'Shown Count: ' + gGame.shownCount + '/' + `${gLevel.SIZE * gLevel.SIZE - gLevel.MINES}`
    var elMarkedCount = document.querySelector('.marked')
    elMarkedCount.innerText = ' Marked Count: ' + gGame.markedCount
    var hint = document.querySelector('.game-hint')
    hint.innerText = 'Hint Left: '+ gGame.hint
} 

function pad(val) {
    var valString = val + '';
    if (valString.length < 2) {
        return '0' + valString;
    } else {
        return valString;
    }
}

function startTimer() {
    var elMinutes = document.querySelector('.minutes');
    var elSeconds = document.querySelector('.seconds');
    var elmilliSeconds = document.querySelector('.miliseconds');
    gStartTime = Date.now()
    gIntervalID = setInterval(function () {
        var timeDiff = Date.now() - gStartTime
        var currTime = new Date(timeDiff)
        elmilliSeconds.innerText = pad(currTime.getMilliseconds());
        elSeconds.innerText = pad(currTime.getSeconds());
        elMinutes.innerText = pad(currTime.getMinutes());
    }, 10);
}

function resetTable() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        lives: 3,
        hint:3
    }
    clearInterval(gIntervalID)
    clickCount = 0
    gStartTime = 0
    var elGameOver = document.querySelector('.game-over')
    var elBtn = document.querySelectorAll('button')
    for (var btn of elBtn)
        btn.style.color = '#e3e1f5'
    elGameOver.innerText = ''
    var elSmile = document.querySelector('.smile')
    elSmile.innerText = '🙄'

    var elMinutes = document.querySelector('.minutes');
    var elSeconds = document.querySelector('.seconds');
    var elmilliSeconds = document.querySelector('.miliseconds');
    elmilliSeconds.innerText = '00'
    elSeconds.innerText = '00'
    elMinutes.innerText = '00'
    initGame()

}
/////////////////
///////////////
/////////////
function hint(){
    if(gGame.hint===0) return
    gGame.hint--
    var hintIdx=[]
    for(var i=0;i<gBoard.length;i++){
        for(j=0;j<gBoard[0].length;j++){
            var cell = gBoard[i][j]
            if(!cell.isMine && !cell.isMarked && !cell.isShown){
              hintIdx.push({i,j})
            }
        }
    }
   var randomHint = getRandomInt(0, hintIdx.length)
var I = hintIdx[randomHint].i
var J = hintIdx[randomHint].j

console.log(gBoard[I][J])
gBoard[I][J].isHinted=true
renderBoard(gBoard)
setTimeout(()=>{
    gBoard[I][J].isHinted=false
    renderBoard(gBoard)
},1000)
}