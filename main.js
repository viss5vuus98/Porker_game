// 建立狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardMatch: "CardMated",
  CardMatchFailed: "CardMatchFailed",
  GameFinish: "GameFinished"
}

const symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png'
]

const view = {
  renderEndPanel() {
    document.querySelector('#render-end').innerHTML = `
    <div id="end-panel">
      <h2 class="end-title">Complete</h2>
      <p>Congratulations!!</p>
      <p>You've tried: 260 times</p>
    </div>
    `
  },
  appendWrongAnimation(...cards) {
    cards.map(card =>{
      card.classList.add('wrong')
      card.addEventListener('animationend', event =>{
        event.target.classList.remove('wrong')
      }, {once: true})
    })
  },
  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },
  renderTriedTimes(triedTimes) {
    document.querySelector('.tried').textContent = `You've tried: ${triedTimes} times`
  },
  pairCard(...cards){
    cards.map(card => {
      card.classList.add("paired")
    }) 
  },
  flipCard(...cards) {
    cards.map(card => {
      if (card.classList.contains("back")) {
        // 回傳正常
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // 回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  // 翻盤判斷邏輯 使用back判斷 數字用data-index 判斷
  transformNumber(number) {
    switch (number) {
      case 1:
        return "A"
      case 11:
        return "J"
      case 12:
        return "Q"
      case 13:
        return "K"
      default:
        return number
    }
  },
  // 3.將數字轉換成字母  
  getCardElement(index) {
    return `
    <div class="card back" data-index="${index}"></div>
    `
  },
  // 1.拆解還是成輸出卡片的ＨＴＭＬ內容
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}">
      <p>${number}</p>
    `
  },
  // 2.加入52張牌的數字與花色計算
  // 7.將 getCardElement（）拆成兩個函式
  displayCard(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join("")
  }
  // 4.利用陣列填入全部 0~51數字 .MAP只能對陣列使用 .join("")陣列轉字串
  // Array(52)(產生空陣列) .keys() (迭代器) Array.from()(將迭代器內的東西轉陣列)
  // 1.把函示拆解成找出＃card節點
}
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
  // 5.將排序的數字陣列洗亂 再回傳displayCard()

}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits, //設定初始狀態

  generateCard() {
    view.displayCard(utility.getRandomNumberArray(52))
  },
   // 加入控制翻盤的核心函式
  disPatchCardAction(card){
    if (!card.classList.contains("back")) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCard(card)
        model.revealedCard.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        return

      case GAME_STATE.SecondCardAwaits:
        view.flipCard(card)
        model.revealedCard.push(card)
        view.renderTriedTimes(++model.triedTimes)
        if (model.isRevealedCard()) {
          this.currentState = GAME_STATE.CardMatch
          view.renderScore(model.score += 10)
          view.pairCard(...model.revealedCard)
          model.revealedCard = []
          if(model.score == 260){
            this.currentState = GAME_STATE.GameFinish
            view.renderEndPanel()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        }else {
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.revealedCard)
          setTimeout(this.resetCard, 1000)    //setTimeout 要的參數是函式本身 所以要呼叫this.resetCard  若呼叫this.resetCard()是叫函式的結果
        }
        
        break  
    }
  },
  resetCard() {  //setTimeout 內容另外分開一個函式縮簡程式碼 
    view.flipCard(...model.revealedCard)   //加入展開運算子縮減程式碼
    model.revealedCard = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

// model 管理資料的地方
const model ={
  revealedCard:[],
  isRevealedCard() {
    return this.revealedCard[0].dataset.index % 13 === this.revealedCard[1].dataset.index % 13
  },
  score: 250,
  triedTimes: 0,
}

controller.generateCard()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.disPatchCardAction(card)
  })
})
// 6.將每張卡片都分別加入一個事件，利用forEach迭代