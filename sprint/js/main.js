var previousValue;
var gLevel = {
    SIZE: 4,
    MINES: 3
}

var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    lives: 3,
    safeClick: 3,
    hint: 3,
    hintStatus: false,
    manually: false
}

var gBoard
var gStartTime = 0
var gIntervalID
var clickCount = 0
var manuallMinesSet = 0
var gameOver = false



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
        gLevel.MINES = 30
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
                isSafe: false,
                isHint: false
            }
            mat[i][j] = cell
        }
    }
    return mat
}


//render
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
            if (cell.isSafe) className = 'safe'
            if (!cell.isMine && cell.isShown && !cell.isMarked) className = 'reg'
            if (cell.minesAroundCount === 0 && !cell.isMine && !cell.isMarked) cell.minesAroundCount = ''
            if (cell.isMarked) {
                cell.minesAroundCount = '🚩'
                className = 'hide'
            }
            if (cell.isShown && !cell.isMine) {
                shownCell.push(cell)
                gGame.shownCount = shownCell.length
            }
            strHTML += `<td class ="cell-${i}-${j} ${className}"oncontextmenu="cellMarked(this, ${i},${j})" onclick="cellClicked(this, ${i},${j})">${cell.minesAroundCount}</td>`
        }
        strHTML += '</tr>'
    }
    var elCell = document.querySelector('.board-container')
    elCell.innerHTML = strHTML
    renderStats()
}



//set mines in a random cell
function setMinesNegsCount(clickI, clickJ) {
    if (gGame.manually) return
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

//set mines manually
function setMinesManually(clickI, clickJ) {
    var elManualBtn = document.querySelector('.manually')
    if (gGame.manually && !gameOver && !gBoard[clickI][clickJ].isMine) {
        if (manuallMinesSet < gLevel.MINES) {
            gBoard[clickI][clickJ].isMine = true
            gBoard[clickI][clickJ].isShown = true
            manuallMinesSet++
            renderBoard(gBoard)
        }
        if (manuallMinesSet === gLevel.MINES && !gameOver) {
            elManualBtn.classList.add('set-play')
            elManualBtn.innerText = 'Press Play'
            elManualBtn.style.color = '#3752cc'
        }
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


//expand empty cells
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

//Left click
function cellClicked(elCell, i, j) {
    if (!gGame.isOn) {
        setMinesManually(i, j)
        return
    }
    clickCount++
    var cell = gBoard[i][j]
    if (clickCount === 1) {
        setMinesNegsCount(i, j)
        startTimer()
    }
    if (gGame.hintStatus) {
        hintRender(i, j)
        return
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
    checkBtn()

}


//Right click
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


//win / lose
function checkGameOver() {
    var elGameOver = document.querySelector('.game-over')
    var elSmile = document.querySelector('.smile')
    if (gGame.lives === 0) {
        gGame.isOn = false
        gameOver = true
        manuallMinesSet = 0
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
                gameOver = true
                manuallMinesSet = 0
                clearInterval(gIntervalID)
                var sec = document.querySelector('.seconds')
                var miliseconds = document.querySelector('.miliseconds')
                var minutes = document.querySelector('.minutes')
                var currTime = `${minutes.innerText}:${sec.innerText}:${miliseconds.innerText}`
                localStorage.setItem('cuurTime', currTime)
                bestTime()
                renderBoard(gBoard)
            }
        }

    }


}

//update best time from local storage
function bestTime() {
    var bestTime = document.querySelector('.best-time')
    if (localStorage.getItem('cuurTime') < bestTime.innerText) {
        bestTime.innerText = 'Best Time: ' + localStorage.getItem('cuurTime')
    }
}



//stats update
function renderStats() {
    var elLives = document.querySelector('.lives')
    elLives.innerText = 'Lives: ' + gGame.lives
    var elShownCount = document.querySelector('.count')
    elShownCount.innerText = 'Shown Count: ' + gGame.shownCount + '/' + `${gLevel.SIZE * gLevel.SIZE - gLevel.MINES}`
    var elMarkedCount = document.querySelector('.marked')
    elMarkedCount.innerText = ' Marked Count: ' + gGame.markedCount
    var safeBtn = document.querySelector('.safe-clickBtn')
    safeBtn.innerText = 'Safe Click: ' + gGame.safeClick
}


//timer
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




//reset game
function resetTable() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        lives: 3,
        safeClick: 3,
        hint: 3,
        hintStatus: false,
        manually: false
    }
    gameOver=false
    clearInterval(gIntervalID)
    clickCount = 0
    gStartTime = 0
    manuallMinesSet =0
    var hint = document.querySelector('.game-hint')
    var elGameOver = document.querySelector('.game-over')
    var elBtn = document.querySelectorAll('button')
    var elManualBtn = document.querySelector('.manually')
    for (var btn of elBtn)
        btn.style.color = '#e3e1f5'
    hint.classList.remove('activate-hint')
    hint.innerText = 'Hint: ' + gGame.hint
    elGameOver.innerText = ''
    var elSmile = document.querySelector('.smile')
    elSmile.innerText = '🙄'
    elManualBtn.innerText = 'Set Manually'
    elManualBtn.classList.remove('set-play')
    var elMinutes = document.querySelector('.minutes');
    var elSeconds = document.querySelector('.seconds');
    var elmilliSeconds = document.querySelector('.miliseconds');
    elmilliSeconds.innerText = '00'
    elSeconds.innerText = '00'
    elMinutes.innerText = '00'
    initGame()
}


//Safe Click button
function safeClick() {
    if (gGame.safeClick === 0) return
    gGame.safeClick--
    var safeClickCords = []
    for (var i = 0; i < gBoard.length; i++) {
        for (j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (!cell.isMine && !cell.isShown) {
                safeClickCords.push({ i, j })
            }
        }
    }
    var randomIdx = getRandomInt(0, safeClickCords.length)
    var I = safeClickCords[randomIdx].i
    var J = safeClickCords[randomIdx].j

    gBoard[I][J].isSafe = true
    renderBoard(gBoard)
    setTimeout(() => {
        gBoard[I][J].isSafe = false
        renderBoard(gBoard)
    }, 1000)
}

//active button
function hintActivate() {
    if (gGame.hint === 0 || gGame.hintStatus) return
    gGame.hintStatus = true
    gGame.hint--
    var hint = document.querySelector('.game-hint')
    hint.classList.add('activate-hint')
    hint.innerText = '💡'
}



//render hiden cells
function hintRender(rowIdx, colIdx) {
    var hint = document.querySelector('.game-hint')
    hint.innerText = 'Hint: ' + gGame.hint

    var idxHint = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
            if (i < 0 || i > gBoard.length - 1) continue
            for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                if (j < 0 || j > gBoard[0].length - 1) continue
                var cell = gBoard[i][j]
                if (!cell.isShown) {
                    cell.isShown = true
                    idxHint.push({ i, j })
                }
            }
        }
    }
    renderBoard(gBoard)

    setTimeout(() => {
        for (var i = 0; i < idxHint.length; i++) {
            gBoard[idxHint[i].i][idxHint[i].j].isShown = false
        }
        renderBoard(gBoard)
        gGame.hintStatus = false
        hint.classList.remove('activate-hint')

    }, 1000);
}




// manually button activate
function manuallyPos() {
    var elManualBtn = document.querySelector('.manually')
    if (gGame.isOn && gGame.manually === false && clickCount===0) {
               gGame.isOn = false
        gGame.manually = true
        elManualBtn.innerText = 'Set ' + gLevel.MINES + ' mines'
        elManualBtn.style.color = '#dbd24a'
    } 
    if (manuallMinesSet === gLevel.MINES){
        gGame.isOn = true
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                var cell = gBoard[i][j]
                cell.isShown = false
                renderBoard(gBoard)
            }
        }
              elManualBtn.classList.remove('set-play')
        elManualBtn.innerText = gLevel.MINES + ' Mines Activated'
        elManualBtn.style.color = '#dbd24a'
    }
}




function checkBtn(){
    var elManualBtn = document.querySelector('.manually')
    if(clickCount > 0){
        elManualBtn.innerText = 'Not Allowed'
    }
}