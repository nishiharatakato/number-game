// 人間とCPUの交互挑戦用ゲーム
let answer = generateAnswer();
console.log("答え（デバッグ用）:", answer);

let turn = 'player'; // 'player' または 'cpu'
let cpuAttempts = 0;
let playerAttempts = 0;

// ゲームクリア演出関数
function showWinMessage(text) {
  const msgEl = document.getElementById('message');
  msgEl.textContent = text;
  msgEl.classList.add('win'); // CSSでポップアニメーション

  // 背景色を一瞬変える
  document.body.style.backgroundColor = "#d4edda"; // 緑っぽい
  setTimeout(() => {
    document.body.style.backgroundColor = "#fafafa"; // 元に戻す
  }, 2000);
}

// 答え生成
function generateAnswer() {
  let digits = ['0','1','2','3','4','5','6','7','8','9'];
  let result = '';
  for (let i=0; i<3; i++) {
    let idx = Math.floor(Math.random() * digits.length);
    result += digits[idx];
    digits.splice(idx, 1);
  }
  return result;
}

// 判定関数
function getHint(guess) {
  let hint = '';
  for (let i=0; i<3; i++) {
    if (guess[i] === answer[i]) {
      hint += '◎';
    } else if (answer.includes(guess[i])) {
      hint += '○';
    } else {
      hint += '×';
    }
  }
  return hint;
}

// プレイヤー判定
document.getElementById('guessBtn').addEventListener('click', function() {
  if (turn !== 'player') return; // CPUのターン中は無視

  const inputEl = document.getElementById('guessInput');
  const guess = inputEl.value;
  if (guess.length !== 3) {
    alert("3桁の数字を入力してください");
    return;
  }

  playerAttempts++;
  const hint = getHint(guess);
  addHistory('プレイヤー', guess, hint);

  if (hint === '◎◎◎') {
    showWinMessage("🎉 プレイヤーの勝利！おめでとう！ 🎉");
    return;
  }

  document.getElementById('message').textContent = "CPUのターンです！";
  turn = 'cpu';

  // 入力欄をクリア & フォーカス戻す
  inputEl.value = "";
  inputEl.focus();

  setTimeout(cpuTurn, 1000); // 1秒後にCPUが挑戦
});

// CPUターン（ランダム）
function cpuTurn() {
  let digits = ['0','1','2','3','4','5','6','7','8','9'];
  let guess = '';
  while (guess.length < 3) {
    let idx = Math.floor(Math.random() * digits.length);
    guess += digits[idx];
    digits.splice(idx, 1);
  }

  cpuAttempts++;
  const hint = getHint(guess);
  addHistory('CPU', guess, hint);

  if (hint === '◎◎◎') {
    showWinMessage("💻 CPUの勝利！");
    turn = '';
    return;
  }

  document.getElementById('message').textContent = "プレイヤーのターンです！";
  turn = 'player';

  // プレイヤーがすぐ打ち込めるようにフォーカスを戻す
  document.getElementById('guessInput').focus();
}

// 履歴追加（テーブル形式）
function addHistory(player, guess, hint) {
  let tr = document.createElement('tr'); // 行を作る

  let tdPlayer = document.createElement('td');
  tdPlayer.textContent = player;
  tr.appendChild(tdPlayer);

  let tdGuess = document.createElement('td');
  tdGuess.textContent = guess;
  tdGuess.classList.add("guess-cell"); // 数字を強調する場合
  tr.appendChild(tdGuess);

  let tdHint = document.createElement('td');
  tdHint.textContent = hint;
  tr.appendChild(tdHint);

  document.getElementById('history').appendChild(tr); // テーブルに追加
}

// リセット
document.getElementById('resetBtn').addEventListener('click', function() {
  answer = generateAnswer();
  console.log("新しい答え（デバッグ用）:", answer);
  document.getElementById('message').textContent = '';
  document.getElementById('message').classList.remove('win'); // クラスリセット
  document.getElementById('history').innerHTML = '';
  document.getElementById('guessInput').value = '';
  document.getElementById('guessInput').focus(); // 入力欄にフォーカス
  turn = 'player';
  cpuAttempts = 0;
  playerAttempts = 0;
});