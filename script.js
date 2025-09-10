const board = document.getElementById("game-board");
const movesCounter = document.getElementById("moves");
const levelCounter = document.getElementById("level");

let level = 1;
let moves = 0;
let firstCard, secondCard;
let lockBoard = false;
let matchedPairs = 0;

function setupBoard() {
  board.innerHTML = "";
  board.className = `board level-${level}`;
  moves = 0;
  movesCounter.textContent = `Moves: ${moves}`;
  levelCounter.textContent = `Level: ${level}`;
  matchedPairs = 0;

  let size = level + 3; // 4x4 → level 1, 5x5 → level 2, 6x6 → level 3
  let totalCards = size * size;

  // Adjust for odd numbers (5x5), remove one card
  if (totalCards % 2 !== 0) totalCards--;

  let numPairs = totalCards / 2;
  let images = [];
  for (let i = 1; i <= numPairs; i++) {
    images.push(`images/img${i}.jpeg`); // placeholder JPEG images
  }

  // Duplicate for pairs and shuffle
  let cardImages = [...images, ...images].sort(() => Math.random() - 0.5);

  // Create cards
  cardImages.forEach(img => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <div class="front"></div>
      <div class="back">
        <img src="${img}" alt="card image">
      </div>
    `;
    card.addEventListener("click", flipCard);
    board.appendChild(card);
  });
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  moves++;
  movesCounter.textContent = `Moves: ${moves}`;

  checkMatch();
}

function checkMatch() {
  let isMatch =
    firstCard.querySelector("img").src === secondCard.querySelector("img").src;

  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  matchedPairs++;
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  resetBoard();

  // Check if level is complete
  let size = level + 3;
  let totalCards = size * size;
  if (totalCards % 2 !== 0) totalCards--; // for odd grids
  if (matchedPairs === totalCards / 2) {
    if (level < 3) {
      setTimeout(() => {
        alert(`Level ${level} complete! Moving to Level ${level + 1}`);
        level++;
        setupBoard();
      }, 800);
    } else {
      setTimeout(() => {
        alert("🎉 Congratulations! You completed all levels!");
      }, 800);
    }
  }
}

function unflipCards() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");

    resetBoard();
  }, 1000);
}

function resetBoard() {
  [firstCard, secondCard, lockBoard] = [null, null, false];
}

// Start the first level
setupBoard();
