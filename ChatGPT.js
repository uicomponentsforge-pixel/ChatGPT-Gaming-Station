// ============================================================
// CHATGPT GAMING STATION — PREMIUM EDITION
// PART 1 / 3
// ============================================================

const STORAGE_KEY = "gamingStationPremiumPlayer";

let player = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  name: "PLAYER ONE",
  xp: 0,
  level: 1,
  coins: 100,
  wins: 0,
  gamesPlayed: 0,
  achievements: [],
  items: []
};

let currentGame = "";
let soundOn = true;
let audioCtx = null;

const games = {
  battle: {
    icon: "⚔️",
    title: "Battle Arena",
    description: "Fight enemies and become the champion."
  },
  puzzle: {
    icon: "🧩",
    title: "Puzzle Zone",
    description: "Solve puzzles and test your brain."
  },
  space: {
    icon: "🚀",
    title: "Space Explorer",
    description: "Explore planets and discover the galaxy."
  },
  racing: {
    icon: "🏎️",
    title: "Racing Station",
    description: "Race against opponents and win."
  },
  archer: {
    icon: "🏹",
    title: "Archer Quest",
    description: "Hit the target and become a master archer."
  },
  blocks: {
    icon: "🧱",
    title: "Block Breaker",
    description: "Break every block on the board."
  },
  snake: {
    icon: "🐍",
    title: "Snake Galaxy",
    description: "Collect stars and grow your snake."
  },
  memory: {
    icon: "🧠",
    title: "Memory Master",
    description: "Remember the sequence and beat the challenge."
  },
  planet: {
    icon: "🪐",
    title: "Planet Defender",
    description: "Defend your planet from incoming attacks."
  },
  reaction: {
    icon: "⚡",
    title: "Reaction Rush",
    description: "React as quickly as possible."
  },
  basketball: {
    icon: "🏀",
    title: "Basketball Challenge",
    description: "Time your shots and score."
  },
  zombie: {
    icon: "🧟",
    title: "Zombie Survival",
    description: "Survive the zombie waves."
  }
};

function savePlayer() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
}

function ensurePlayer() {
  player.level = Math.floor(player.xp / 100) + 1;
  savePlayer();
}

function setText(id, value) {
  const el = document.getElementById(id);

  if (el) {
    el.textContent = value;
  }
}

function updateUI() {
  ensurePlayer();

  setText("headerXP", player.xp);
  setText("headerCoins", player.coins);
  setText("headerLevel", player.level);

  setText("profileLevel", player.level);
  setText("profileXP", player.xp);
  setText("profileCoins", player.coins);
  setText("profileWins", player.wins);
  setText("profileGames", player.gamesPlayed);

  setText("xpLevel", player.level);
  setText("currentXP", player.xp % 100);
  setText("neededXP", 100);

  setText("leaderXP", player.xp + " XP");
  setText("shopCoins", player.coins);

  const bar = document.getElementById("profileXPBar");

  if (bar) {
    bar.style.width = (player.xp % 100) + "%";
  }

  updateAchievements();
}

function showPage(id) {
  document
    .querySelectorAll(".page")
    .forEach(page => page.classList.remove("active"));

  const page = document.getElementById(id);

  if (page) {
    page.classList.add("active");
  }

  closeGame(false);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  playTone("click");
  updateUI();
}

function initAudio() {
  if (!soundOn) return;

  if (!audioCtx) {
    audioCtx = new (
      window.AudioContext ||
      window.webkitAudioContext
    )();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playTone(type = "click") {
  if (!soundOn) return;

  try {
    initAudio();

    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    const now = audioCtx.currentTime;

    const frequency =
      type === "win"
        ? 660
        : type === "lose"
        ? 180
        : type === "level"
        ? 880
        : 420;

    oscillator.frequency.setValueAtTime(
      frequency,
      now
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * 1.45,
      now + 0.14
    );

    gain.gain.setValueAtTime(
      0.0001,
      now
    );

    gain.gain.exponentialRampToValueAtTime(
      0.08,
      now + 0.015
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 0.18
    );

    oscillator.connect(gain);
    gain.connect(audioCtx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.2);

  } catch (error) {
    console.log("Audio unavailable.");
  }
}

function addReward(text) {
  const element = document.createElement("div");

  element.className = "reward-popup";
  element.textContent = text;

  document.body.appendChild(element);

  setTimeout(() => {
    element.remove();
  }, 1150);
}

function giveXP(amount) {
  const oldLevel = player.level;

  player.xp += amount;

  const coinsEarned = Math.max(
    1,
    Math.floor(amount / 5)
  );

  player.coins += coinsEarned;

  player.level =
    Math.floor(player.xp / 100) + 1;

  addReward(
    `+${amount} XP   +${coinsEarned} 🪙`
  );

  if (player.level > oldLevel) {

    playTone("level");

    setTimeout(() => {
      showToast(
        "🎉 LEVEL UP!",
        `You reached Level ${player.level}!`
      );
    }, 250);

  } else {
    playTone("win");
  }

  savePlayer();
  updateUI();
}

function gameFinished(won, reward = 0) {

  player.gamesPlayed++;

  if (won) {

    player.wins++;

    giveXP(reward);

  } else {

    playTone("lose");

    savePlayer();
    updateUI();
  }
}

function unlockAchievement(id) {

  if (player.achievements.includes(id)) {
    return;
  }

  player.achievements.push(id);

  player.coins += 25;

  savePlayer();

  playTone("level");

  showToast(
    "🏆 ACHIEVEMENT UNLOCKED!",
    "+25 🪙 bonus"
  );
}

function updateAchievements() {

  if (player.wins >= 1) {
    unlockAchievement("first");
  }

  if (player.gamesPlayed >= 10) {
    unlockAchievement("ten");
  }

  if (player.level >= 5) {
    unlockAchievement("level5");
  }

  if (player.xp >= 1000) {
    unlockAchievement("xp");
  }

  ["first", "ten", "level5", "xp"].forEach(id => {

    const element =
      document.getElementById(
        "achievement-" + id
      );

    if (element) {

      element.classList.toggle(
        "unlocked",
        player.achievements.includes(id)
      );

      element.classList.toggle(
        "locked",
        !player.achievements.includes(id)
      );
    }

  });
}

function showToast(title, message) {

  const old =
    document.getElementById("premiumToast");

  if (old) {
    old.remove();
  }

  const toast =
    document.createElement("div");

  toast.id = "premiumToast";

  toast.style.cssText = `
    position:fixed;
    right:22px;
    top:88px;
    z-index:9999;
    padding:16px 20px;
    border:1px solid rgba(0,229,255,.35);
    border-radius:16px;
    background:rgba(13,18,34,.96);
    box-shadow:0 18px 55px rgba(0,0,0,.45);
  `;

  toast.innerHTML = `
    <strong>${title}</strong>
    <br>
    <span style="color:#9ba6c7">
      ${message}
    </span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
// ============================================================
// CHATGPT GAMING STATION — PREMIUM EDITION
// PART 2 / 3
// ============================================================

function createPremiumLoader() {

  const loader =
    document.createElement("div");

  loader.id = "premiumLoader";

  loader.innerHTML = `
    <div class="loader-box">

      <div class="loader-logo">
        🎮
      </div>

      <div class="loader-title">
        CHATGPT GAMING STATION
      </div>

      <div class="loader-sub">
        PREMIUM EDITION
      </div>

      <div class="loader-track">
        <div class="loader-fill"></div>
      </div>

    </div>
  `;

  document.body.prepend(loader);

  setTimeout(() => {
    loader.classList.add("hide");
  }, 1800);

  setTimeout(() => {
    loader.remove();
  }, 2500);
}

function createSoundButton() {

  const button =
    document.createElement("button");

  button.className =
    "sound-toggle";

  button.title =
    "Toggle sound";

  button.textContent = "🔊";

  button.onclick = () => {

    soundOn = !soundOn;

    button.textContent =
      soundOn ? "🔊" : "🔇";

    if (soundOn) {
      playTone("click");
    }

  };

  document.body.appendChild(button);
}

function createNewGameCards() {

  const container =
    document.querySelector(".games");

  if (!container) return;

  Object.keys(games).forEach(key => {

    if (
      container.querySelector(
        `[data-game="${key}"]`
      )
    ) {
      return;
    }

    const game = games[key];

    const card =
      document.createElement("div");

    card.className = "game-card";

    card.dataset.game = key;

    card.onclick = () =>
      startGame(key);

    card.innerHTML = `
      <div class="game-icon">
        ${game.icon}
      </div>

      <h3>
        ${game.title}
      </h3>

      <p>
        ${game.description}
      </p>

      <button type="button">
        PLAY
      </button>
    `;

    container.appendChild(card);

  });
}

function startGame(key) {

  currentGame = key;

  const game = games[key];

  const screen =
    document.getElementById("gameScreen");

  if (!screen) return;

  const icon =
    document.getElementById("gameIcon");

  const title =
    document.getElementById("gameTitle");

  const description =
    document.getElementById(
      "gameDescription"
    );

  if (icon) {
    icon.textContent = game.icon;
  }

  if (title) {
    title.textContent = game.title;
  }

  if (description) {
    description.textContent =
      game.description;
  }

  screen.style.display = "block";

  document.body.style.overflow =
    "hidden";

  playTone("click");
}

function closeGame(sound = true) {

  const screen =
    document.getElementById("gameScreen");

  if (screen) {
    screen.style.display = "none";
  }

  document.body.style.overflow = "";

  if (sound) {
    playTone("click");
  }
}

function returnToStation() {

  closeGame();

  showPage("home");
}

function setGameHTML(html) {

  const content =
    document.querySelector(
      ".game-content"
    );

  if (content) {
    content.innerHTML = html;
  }
}

function playGame() {

  const starters = {

    battle: startBattle,
    puzzle: startPuzzle,
    space: startSpace,
    racing: startRacing,
    archer: startArcher,
    blocks: startBlockBreaker,
    snake: startSnake,
    memory: startMemory,
    planet: startPlanetDefender,
    reaction: startReaction,
    basketball: startBasketball,
    zombie: startZombie

  };

  if (starters[currentGame]) {
    starters[currentGame]();
  }
}


// ============================================================
// BATTLE ARENA
// ============================================================

function startBattle() {

  let playerHP = 100;
  let enemyHP = 100;
  let ended = false;

  setGameHTML(`

    <button
      class="back"
      onclick="closeGame()"
    >
      ← BACK
    </button>

    <div class="game-big-icon">
      ⚔️
    </div>

    <h2>
      BATTLE ARENA
    </h2>

    <div class="fighters">

      <div>

        <div class="fighter-icon">
          🧙
        </div>

        <h3>
          PLAYER
        </h3>

        <div class="health-bar">
          <div
            id="pHealth"
            style="width:100%"
          ></div>
        </div>

        <p id="pHP">
          HP: 100
        </p>

      </div>

      <div class="vs">
        VS
      </div>

      <div>

        <div class="fighter-icon">
          👹
        </div>

        <h3>
          ENEMY
        </h3>

        <div class="health-bar">
          <div
            id="eHealth"
            style="width:100%"
          ></div>
        </div>

        <p id="eHP">
          HP: 100
        </p>

      </div>

    </div>

    <div
      class="battle-log"
      id="battleLog"
    >
      Choose your attack.
    </div>

    <div class="battle-buttons">

      <button
        class="game-action"
        id="attack"
      >
        ⚔️ ATTACK
      </button>

      <button
        class="game-action"
        id="heavy"
      >
        💥 HEAVY
      </button>

      <button
        class="game-action"
        id="heal"
      >
        ❤️ HEAL
      </button>

    </div>

  `);

  const update = () => {

    document.getElementById(
      "pHealth"
    ).style.width =
      playerHP + "%";

    document.getElementById(
      "eHealth"
    ).style.width =
      enemyHP + "%";

    setText(
      "pHP",
      "HP: " + playerHP
    );

    setText(
      "eHP",
      "HP: " + enemyHP
    );

  };

  const finish = won => {

    if (ended) return;

    ended = true;

    gameFinished(
      won,
      won ? 100 : 0
    );

    document.querySelector(
      ".battle-buttons"
    ).innerHTML = `

      <h2>
        ${won
          ? "🏆 YOU WIN!"
          : "💀 YOU LOST!"}
      </h2>

      ${
        won
          ? "<p>+100 XP</p>"
          : ""
      }

      <button
        class="game-action"
        onclick="startBattle()"
      >
        🔄 PLAY AGAIN
      </button>

      <button
        class="game-action"
        onclick="returnToStation()"
      >
        🎮 STATION
      </button>

    `;
  };

  const enemyTurn = () => {

    if (ended) return;

    const damage =
      5 +
      Math.floor(
        Math.random() * 11
      );

    playerHP =
      Math.max(
        0,
        playerHP - damage
      );

    update();

    document.getElementById(
      "battleLog"
    ).textContent =
      `👹 Enemy dealt ${damage} damage!`;

    if (playerHP <= 0) {
      finish(false);
    }
  };

  const attack = damage => {

    if (ended) return;

    enemyHP =
      Math.max(
        0,
        enemyHP - damage
      );

    update();

    if (enemyHP <= 0) {
      finish(true);
    } else {
      setTimeout(
        enemyTurn,
        350
      );
    }
  };

  document.getElementById(
    "attack"
  ).onclick = () => {

    attack(
      10 +
      Math.floor(
        Math.random() * 11
      )
    );

  };

  document.getElementById(
    "heavy"
  ).onclick = () => {

    attack(
      18 +
      Math.floor(
        Math.random() * 18
      )
    );

  };

  document.getElementById(
    "heal"
  ).onclick = () => {

    if (ended) return;

    playerHP =
      Math.min(
        100,
        playerHP + 15
      );

    update();

    setTimeout(
      enemyTurn,
      350
    );
  };

}


// ============================================================
// PUZZLE ZONE
// ============================================================

function startPuzzle() {

  const a =
    1 +
    Math.floor(
      Math.random() * 30
    );

  const b =
    1 +
    Math.floor(
      Math.random() * 30
    );

  const answer = a + b;

  setGameHTML(`

    <button
      class="back"
      onclick="closeGame()"
    >
      ← BACK
    </button>

    <div class="game-big-icon">
      🧩
    </div>

    <h2>
      PUZZLE ZONE
    </h2>

    <p>
      Solve the equation.
    </p>

    <div class="puzzle-question">
      ${a} + ${b} = ?
    </div>

    <input
      id="puzzleInput"
      type="number"
      placeholder="Answer"
    >

    <br>

    <button
      class="game-action"
      id="checkPuzzle"
    >
      CHECK
    </button>

    <div id="puzzleResult"></div>

  `);

  document.getElementById(
    "checkPuzzle"
  ).onclick = () => {

    const result =
      document.getElementById(
        "puzzleResult"
      );

    const value =
      Number(
        document.getElementById(
          "puzzleInput"
        ).value
      );

    if (value === answer) {

      gameFinished(
        true,
        75
      );

      result.innerHTML = `

        <h2>
          🎉 CORRECT!
        </h2>

        <p>
          +75 XP
        </p>

        <button
          class="game-action"
          onclick="startPuzzle()"
        >
          NEXT
        </button>

        <button
          class="game-action"
          onclick="returnToStation()"
        >
          STATION
        </button>

      `;

    } else {

      result.textContent =
        "❌ Not quite. Try again!";

    }

  };
}


// ============================================================
// SPACE EXPLORER
// ============================================================

function startSpace() {

  let energy = 100;
  let done = false;

  setGameHTML(`

    <button
      class="back"
      onclick="closeGame()"
    >
      ← BACK
    </button>

    <div class="game-big-icon">
      🚀
    </div>

    <h2>
      SPACE EXPLORER
    </h2>

    <p>
      Explore destinations until your mission is complete.
    </p>

    <h3>
      ⚡ Energy:
      <span id="spaceEnergy">
        100
      </span>
    </h3>

    <div class="space-buttons">

      <button data-dest="Mars">
        🔴 MARS
      </button>

      <button data-dest="Neptune">
        🔵 NEPTUNE
      </button>

      <button data-dest="Alien World">
        👽 ALIEN WORLD
      </button>

    </div>

    <div id="spaceResult">
      🌌 Choose a destination.
    </div>

  `);

  document
    .querySelectorAll("[data-dest]")
    .forEach(button => {

      button.onclick = () => {

        if (done) return;

        energy =
          Math.max(
            0,
            energy -
            (
              10 +
              Math.floor(
                Math.random() * 16
              )
            )
          );

        setText(
          "spaceEnergy",
          energy
        );

        document.getElementById(
          "spaceResult"
        ).textContent =
          `🌌 You explored ${button.dataset.dest}!`;

        if (energy === 0) {

          done = true;

          gameFinished(
            true,
            80
          );

          document.getElementById(
            "spaceResult"
          ).innerHTML = `

            <h2>
              🏆 MISSION COMPLETE!
            </h2>

            <p>
              +80 XP
            </p>

            <button
              class="game-action"
              onclick="startSpace()"
            >
              NEW MISSION
            </button>

          `;
        }

      };

    });

}


// ============================================================
// RACING STATION
// ============================================================

function startRacing() {

  let playerProgress = 0;
  let enemyProgress = 0;
  let done = false;

  setGameHTML(`

    <button
      class="back"
      onclick="closeGame()"
    >
      ← BACK
    </button>

    <div class="game-big-icon">
      🏎️
    </div>

    <h2>
      RACING STATION
    </h2>

    <p>
      Reach 100% first.
    </p>

    <div class="race-track">
      <div id="playerCar">
        🏎️
      </div>
    </div>

    <div class="race-track">
      <div id="enemyCar">
        🚗
      </div>
    </div>

    <button
      class="game-action"
      id="boost"
    >
      🏎️ BOOST!
    </button>

    <div id="raceResult">
      READY!
    </div>

  `);

  document.getElementById(
    "boost"
  ).onclick = () => {

    if (done) return;

    playerProgress =
      Math.min(
        100,
        playerProgress +
        10 +
        Math.floor(
          Math.random() * 16
        )
      );

    enemyProgress =
      Math.min(
        100,
        enemyProgress +
        7 +
        Math.floor(
          Math.random() * 12
        )
      );

    document.getElementById(
      "playerCar"
    ).style.width =
      playerProgress + "%";

    document.getElementById(
      "enemyCar"
    ).style.width =
      enemyProgress + "%";

    if (playerProgress >= 100) {

      done = true;

      gameFinished(
        true,
        120
      );

      document.getElementById(
        "raceResult"
      ).innerHTML = `

        🏆 YOU WON!

        <br>

        +120 XP

        <br>

        <button
          class="game-action"
          onclick="startRacing()"
        >
          RACE AGAIN
        </button>

      `;

    } else if (
      enemyProgress >= 100
    ) {

      done = true;

      gameFinished(
        false,
        0
      );

      document.getElementById(
        "raceResult"
      ).innerHTML = `

        💀 YOU LOST!

        <br>

        <button
          class="game-action"
          onclick="startRacing()"
        >
          TRY AGAIN
        </button>

      `;

    }

  };

}
// ============================================================
// CHATGPT GAMING STATION — PREMIUM EDITION
// PART 3 / 3
// ============================================================

// ================= ARCHER QUEST =================

function startArcher() {

  const target =
    1 +
    Math.floor(
      Math.random() * 10
    );

  setGameHTML(`

    <button
      class="back"
      onclick="closeGame()"
    >
      ← BACK
    </button>

    <div class="game-big-icon">
      🏹
    </div>

    <h2>
      ARCHER QUEST
    </h2>

    <p>
      Hit target number
      <strong>${target}</strong>.
    </p>

    <input
      id="archerInput"
      type="number"
      min="1"
      max="10"
      placeholder="1-10"
    >

    <br>

    <button
      class="game-action"
      id="shoot"
    >
      🏹 SHOOT
    </button>

    <div id="archerResult"></div>

  `);

  document.getElementById(
    "shoot"
  ).onclick = () => {

    const result =
      document.getElementById(
        "archerResult"
      );

    if (
      Number(
        document.getElementById(
          "archerInput"
        ).value
      ) === target
    ) {

      gameFinished(
        true,
        90
      );

      result.innerHTML = `

        <h2>
          🎯 BULLSEYE!
        </h2>

        <p>
          +90 XP
        </p>

        <button
          class="game-action"
          onclick="startArcher()"
        >
          PLAY AGAIN
        </button>

      `;

    } else {

      result.textContent =
        "🏹 Missed! Try again.";

    }

  };
}


// ================= BLOCK BREAKER =================

function startBlockBreaker() {

  let blocks = 12;

  setGameHTML(`

    <button
      class="back"
      onclick="closeGame()"
    >
      ← BACK
    </button>

    <div class="game-big-icon">
      🧱
    </div>

    <h2>
      BLOCK BREAKER
    </h2>

    <p>
      Break all 12 blocks.
    </p>

    <div
      id="blockBoard"
      style="
        display:grid;
        grid-template-columns:repeat(4,70px);
        gap:8px;
        justify-content:center;
        margin:25px;
      "
    ></div>

    <div id="blockResult">
      Blocks remaining: 12
    </div>

  `);

  const board =
    document.getElementById(
      "blockBoard"
    );

  for (
    let i = 0;
    i < 12;
    i++
  ) {

    const block =
      document.createElement(
        "button"
      );

    block.textContent = "🧱";

    block.style.cssText = `
      font-size:28px;
      padding:15px;
      cursor:pointer;
    `;

    block.onclick = () => {

      if (block.disabled) return;

      block.disabled = true;
      block.textContent = "💥";

      blocks--;

      setText(
        "blockResult",
        "Blocks remaining: " + blocks
      );

      if (blocks === 0) {

        gameFinished(
          true,
          110
        );

        document.getElementById(
          "blockResult"
        ).innerHTML = `

          🏆 BOARD CLEARED!

          <br>

          +110 XP

          <br>

          <button
            class="game-action"
            onclick="startBlockBreaker()"
          >
            PLAY AGAIN
          </button>

        `;

      }

    };

    board.appendChild(block);

  }
}


// ================= SNAKE GALAXY =================

function startSnake() {

  let score = 0;

  setGameHTML(`

    <button
      class="back"
      onclick="closeGame()"
    >
      ← BACK
    </button>

    <div class="game-big-icon">
      🐍
    </div>

    <h2>
      SNAKE GALAXY
    </h2>

    <p>
      Collect 5 stars.
    </p>

    <div
      id="snakeGame"
      style="
        width:300px;
        height:220px;
        margin:25px auto;
        border:2px solid #00e5ff;
        position:relative;
        background:#10152b;
      "
    >

      <div
        id="snake"
        style="
          position:absolute;
          left:20px;
          top:90px;
          font-size:30px;
        "
      >
        🐍
      </div>

    </div>

    <p>
      Stars:
      <span id="snakeScore">
        0
      </span>/5
    </p>

    <button
      class="game-action"
      id="snakeMove"
    >
      🐍 MOVE
    </button>

  `);

  document.getElementById(
    "snakeMove"
  ).onclick = () => {

    score++;

    setText(
      "snakeScore",
      score
    );

    document.getElementById(
      "snake"
    ).style.left =
      Math.min(
        250,
        20 + score * 45
      ) + "px";

    if (score >= 5) {

      gameFinished(
        true,
        100
      );

      document.getElementById(
        "snakeGame"
      ).innerHTML = `

        <div
          style="
            text-align:center;
            padding-top:70px;
            font-size:28px;
          "
        >
          🏆
          <br>
          GALAXY CLEARED!
        </div>

        <button
          class="game-action"
          onclick="startSnake()"
        >
          PLAY AGAIN
        </button>

      `;

    }

  };

}


// ================= MEMORY MASTER =================

function startMemory() {

  const sequence =
    Array.from(
      { length: 4 },
      () =>
        Math.floor(
          Math.random() * 4
        )
    );

  let entered = [];

  setGameHTML(`

    <button
      class="back"
      onclick="closeGame()"
    >
      ← BACK
    </button>

    <div class="game-big-icon">
      🧠
    </div>

    <h2>
      MEMORY MASTER
    </h2>

    <p>
      Remember this sequence.
    </p>

    <h2 id="memorySequence">
      ${sequence.join(" - ")}
    </h2>

    <div id="memoryButtons">

      <button
        class="game-action"
        data-num="0"
      >
        🔵 0
      </button>

      <button
        class="game-action"
        data-num="1"
      >
        🟢 1
      </button>

      <button
        class="game-action"
        data-num="2"
      >
        🟡 2
      </button>

      <button
        class="game-action"
        data-num="3"
      >
        🔴 3
      </button>

    </div>

    <div id="memoryResult"></div>

  `);

  setTimeout(() => {

    setText(
      "memorySequence",
      "???"
    );

  }, 2200);

  document
    .querySelectorAll("[data-num]")
    .forEach(button => {

      button.onclick = () => {

        entered.push(
          Number(
            button.dataset.num
          )
        );

        const index =
          entered.length - 1;

        if (
          entered[index] !==
          sequence[index]
        ) {

          document.getElementById(
            "memoryResult"
          ).innerHTML = `

            ❌ Wrong!

            <br>

            <button
              class="game-action"
              onclick="startMemory()"
            >
              TRY AGAIN
            </button>

          `;

          document
            .querySelectorAll(
              "[data-num]"
            )
            .forEach(
              button =>
                button.disabled = true
            );

        } else if (
          entered.length ===
          sequence.length
        ) {

          gameFinished(
            true,
            100
          );

          document.getElementById(
            "memoryResult"
          ).innerHTML = `

            <h2>
              🧠 PERFECT MEMORY!
            </h2>

            <p>
              +100 XP
            </p>

            <button
              class="game-action"
              onclick="startMemory()"
            >
              PLAY AGAIN
            </button>

          `;

        }

      };

    });

}


// ================= PLANET DEFENDER =================

function startPlanetDefender() {

  let health = 100;
  let wave = 0;
  let done = false;

  setGameHTML(`

    <button
      class="back"
      onclick="closeGame()"
    >
      ← BACK
    </button>

    <div class="game-big-icon">
      🪐
    </div>

    <h2>
      PLANET DEFENDER
    </h2>

    <p>
      Survive 5 attack waves.
    </p>

    <h3>
      🛡️ Health:
      <span id="planetHealth">
        100
      </span>
    </h3>

    <h3>
      Wave:
      <span id="planetWave">
        0
      </span>/5
    </h3>

    <button
      class="game-action"
      id="defend"
    >
      🛡️ DEFEND
    </button>

    <div id="planetResult"></div>

  `);

  document.getElementById(
    "defend"
  ).onclick = () => {

    if (done) return;

    wave++;

    health =
      Math.max(
        0,
        health -
        (
          5 +
          Math.floor(
            Math.random() * 16
          )
        )
      );

    setText(
      "planetHealth",
      health
    );

    setText(
      "planetWave",
      wave
    );

    if (health <= 0) {

      done = true;

      gameFinished(false);

      document.getElementById(
        "planetResult"
      ).innerHTML = `

        💥 PLANET DESTROYED!

        <br>

        <button
          class="game-action"
          onclick="startPlanetDefender()"
        >
          TRY AGAIN
        </button>

      `;

    } else if (wave >= 5) {

      done = true;

      gameFinished(
        true,
        130
      );

      document.getElementById(
        "planetResult"
      ).innerHTML = `

        <h2>
          🏆 PLANET SAVED!
        </h2>

        <p>
          +130 XP
        </p>

        <button
          class="game-action"
          onclick="startPlanetDefender()"
        >
          PLAY AGAIN
        </button>

      `;

    } else {

      document.getElementById(
        "planetResult"
      ).textContent =
        "🌠 Attack wave defeated!";

    }

  };

}


// ================= REACTION RUSH =================

function startReaction() {

  setGameHTML(`

    <button
      class="back"
      onclick="closeGame()"
    >
      ← BACK
    </button>

    <div class="game-big-icon">
      ⚡
    </div>

    <h2>
      REACTION RUSH
    </h2>

    <p>
      Wait for green, then click.
    </p>

    <button
      id="reactionButton"
      style="
        width:250px;
        height:120px;
        margin:30px;
        border:none;
        border-radius:20px;
        background:#252b40;
        color:white;
        font-size:25px;
        cursor:pointer;
      "
    >
      WAIT...
    </button>

    <div id="reactionResult"></div>

  `);

  const button =
    document.getElementById(
      "reactionButton"
    );

  let ready = false;

  const timer =
    setTimeout(() => {

      ready = true;

      button.textContent =
        "🟢 CLICK NOW!";

      button.style.background =
        "#00a85a";

    }, 1200 + Math.random() * 2500);

  button.onclick = () => {

    if (!ready) {

      clearTimeout(timer);

      document.getElementById(
        "reactionResult"
      ).innerHTML = `

        ❌ Too early!

        <br>

        <button
          class="game-action"
          onclick="startReaction()"
        >
          TRY AGAIN
        </button>

      `;

      return;
    }

    gameFinished(
      true,
      100
    );

    document.getElementById(
      "reactionResult"
    ).innerHTML = `

      <h2>
        ⚡ LIGHTNING FAST!
      </h2>

      <p>
        +100 XP
      </p>

      <button
        class="game-action"
        onclick="startReaction()"
      >
        PLAY AGAIN
      </button>

    `;

  };

}


// ================= BASKETBALL =================

function startBasketball() {

  let shots = 0;
  let score = 0;
  let done = false;

  setGameHTML(`

    <button
      class="back"
      onclick="closeGame()"
    >
      ← BACK
    </button>

    <div class="game-big-icon">
      🏀
    </div>

    <h2>
      BASKETBALL CHALLENGE
    </h2>

    <p>
      Score at least 3 baskets out of 5.
    </p>

    <h3>
      Score:
      <span id="basketScore">
        0
      </span>
      /
      <span id="basketShots">
        0
      </span>
    </h3>

    <button
      class="game-action"
      id="shootBasket"
    >
      🏀 SHOOT
    </button>

    <div id="basketResult"></div>

  `);

  document.getElementById(
    "shootBasket"
  ).onclick = () => {

    if (done) return;

    shots++;

    if (Math.random() < 0.62) {
      score++;
    }

    setText(
      "basketScore",
      score
    );

    setText(
      "basketShots",
      shots
    );

    if (shots === 5) {

      done = true;

      const won =
        score >= 3;

      gameFinished(
        won,
        won ? 100 : 0
      );

      document.getElementById(
        "basketResult"
      ).innerHTML = won
        ? `
          <h2>
            🏆 YOU WIN!
          </h2>

          <p>
            +100 XP
          </p>

          <button
            class="game-action"
            onclick="startBasketball()"
          >
            PLAY AGAIN
          </button>
        `
        : `
          <h2>
            😅 TRY AGAIN!
          </h2>

          <button
            class="game-action"
            onclick="startBasketball()"
          >
            PLAY AGAIN
          </button>
        `;

    }

  };

}


// ================= ZOMBIE SURVIVAL =================

function startZombie() {

  let health = 100;
  let wave = 0;
  let done = false;

  setGameHTML(`

    <button
      class="back"
      onclick="closeGame()"
    >
      ← BACK
    </button>

    <div class="game-big-icon">
      🧟
    </div>

    <h2>
      ZOMBIE SURVIVAL
    </h2>

    <p>
      Survive 6 waves.
    </p>

    <h3>
      ❤️ Health:
      <span id="zombieHealth">
        100
      </span>
    </h3>

    <h3>
      🌊 Wave:
      <span id="zombieWave">
        0
      </span>/6
    </h3>

    <button
      class="game-action"
      id="survive"
    >
      🛡️ SURVIVE WAVE
    </button>

    <div id="zombieResult"></div>

  `);

  document.getElementById(
    "survive"
  ).onclick = () => {

    if (done) return;

    wave++;

    health =
      Math.max(
        0,
        health -
        (
          5 +
          Math.floor(
            Math.random() * 16
          )
        )
      );

    setText(
      "zombieHealth",
      health
    );

    setText(
      "zombieWave",
      wave
    );

    if (health <= 0) {

      done = true;

      gameFinished(false);

      document.getElementById(
        "zombieResult"
      ).innerHTML = `

        💀 THE ZOMBIES GOT YOU!

        <br>

        <button
          class="game-action"
          onclick="startZombie()"
        >
          TRY AGAIN
        </button>

      `;

    } else if (wave >= 6) {

      done = true;

      gameFinished(
        true,
        150
      );

      document.getElementById(
        "zombieResult"
      ).innerHTML = `

        <h2>
          🏆 SURVIVAL MASTER!
        </h2>

        <p>
          +150 XP
        </p>

        <button
          class="game-action"
          onclick="startZombie()"
        >
          PLAY AGAIN
        </button>

      `;

    } else {

      document.getElementById(
        "zombieResult"
      ).textContent =
        "🧟 Wave defeated!";

    }

  };

}


// ================= SHOP =================

function buyItem(name, price) {

  if (
    player.items.includes(name)
  ) {

    showToast(
      "ℹ️ ALREADY OWNED",
      "You already own this item."
    );

    return;
  }

  if (
    player.coins < price
  ) {

    showToast(
      "❌ NOT ENOUGH COINS",
      "Play games to earn more."
    );

    return;
  }

  player.coins -= price;

  player.items.push(name);

  savePlayer();

  updateUI();

  playTone("win");

  showToast(
    "🛒 PURCHASED!",
    `${name} is now in your collection.`
  );
}


// ================= STARTUP =================

document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {
      closeGame();
    }

    if (event.key === "Enter") {
      initAudio();
    }

  }
);

document.addEventListener(
  "pointerdown",
  () => {
    initAudio();
  },
  { once: true }
);

window.addEventListener(
  "DOMContentLoaded",
  () => {

    createPremiumLoader();

    createSoundButton();

    createNewGameCards();

    updateUI();

  }
);