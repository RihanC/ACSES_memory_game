import { collection, addDoc, query, orderBy, limit, getDocs } 
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const board = document.getElementById("game-board");
  const movesCounter = document.getElementById("moves");
  const levelCounter = document.getElementById("level");
  const introScreen = document.getElementById("intro-screen");
  const gameContainer = document.getElementById("game-container");
  const startBtn = document.getElementById("start-btn");

  // Audio
  const bgMusic = document.getElementById("bg-music");
  const flipSound = document.getElementById("flip-sound");

  // Game variables
  let level = 1;
  let moves = 0;
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let matchedPairs = 0;
  let totalMoves = 0;

  // Start game
  startBtn.addEventListener("click", () => {
    introScreen.classList.add("hidden");
    gameContainer.classList.remove("hidden");

    bgMusic.volume = 0.3;
    bgMusic.play().catch(() => console.log("User interaction required to play music"));

    setupBoard();
  });

  // Setup board
  function setupBoard() {
    board.innerHTML = "";
    board.className = `board level-${level}`;
    moves = 0;
    movesCounter.textContent = `Moves: ${moves}`;
    levelCounter.textContent = `Level: ${level}`;
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = false;

    let size = level + 3; // level 1=4x4, 2=5x5, 3=6x6
    let totalCards = size * size;
    if (totalCards % 2 !== 0) totalCards--;

    let numPairs = totalCards / 2;

    // Load images
    let images = [];
    for (let i = 1; i <= numPairs; i++) {
      images.push(`images/img${i}.jpeg`);
    }

    let cardImages = [...images, ...images];
    cardImages.sort(() => Math.random() - 0.5);

    cardImages.forEach(img => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <div class="front"></div>
        <div class="back">
          <img src="${img}" alt="card image">
        </div>
      `;
      card.addEventListener("click", () => flipCard(card));
      board.appendChild(card);
    });
  }

  // Flip card
  function flipCard(card) {
    if (lockBoard || card === firstCard) return;

    card.classList.add("flipped");
    playFlipSound();

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    moves++;
    totalMoves++;
    movesCounter.textContent = `Moves: ${moves}`;

    checkMatch();
  }

  function checkMatch() {
    if (firstCard.querySelector("img").src === secondCard.querySelector("img").src) {
      disableCards();
    } else {
      unflipCards();
    }
  }

  function disableCards() {
    matchedPairs++;
    resetBoard();

    let size = level + 3;
    let totalCards = size * size;
    if (totalCards % 2 !== 0) totalCards--;

    if (matchedPairs === totalCards / 2) {
      if (level < 3) {
        setTimeout(() => {
          Swal.fire({
            title: `Level ${level} Complete 🎉`,
            text: `Get ready for Level ${level + 1}`,
            icon: "success",
            confirmButtonText: "Next Level"
          }).then(() => {
            level++;
            setupBoard();
          });
        }, 500);
      } else {
        setTimeout(() => {
          Swal.fire({
            title: "🏆 Congratulations!",
            text: "You completed all levels!",
            icon: "success",
            input: "text",
            inputLabel: "Enter your name for the leaderboard",
            confirmButtonText: "Submit"
          }).then(result => {
            if (result.value) {
              saveScore(result.value, totalMoves).then(() => {
                loadLeaderboard();
              });
            }
            level = 1;
            totalMoves = 0;
            setupBoard();
          });
        }, 500);
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

  function playFlipSound() {
    flipSound.currentTime = 0;
    flipSound.play();
  }

  // ✅ Save score
  async function saveScore(username, totalMoves) {
    try {
      await addDoc(collection(window.db, "scores"), {
        name: username,
        moves: totalMoves,
        timestamp: Date.now()
      });
      console.log("Score saved!");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  // ✅ Load leaderboard
  async function loadLeaderboard() {
    const q = query(collection(window.db, "scores"), orderBy("moves", "asc"), limit(5));
    const querySnapshot = await getDocs(q);

    const list = document.getElementById("leaderboard-list");
    list.innerHTML = "";

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement("li");
      li.textContent = `${data.name} — ${data.moves} moves`;
      list.appendChild(li);
    });
  }

  // Load leaderboard on page open
  loadLeaderboard();
});
