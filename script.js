// 人間とCPUの交互挑戦用ゲーム
let answer = generateAnswer();
console.log("答え（デバッグ用）:", answer);
let turn = 'player'; // 'player' または 'cpu'
let cpuAttempts = 0;
let historyData = [];
let playerAttempts = 0;

// --- モード管理 ---
let mode = 'easy'; // デフォルト

// モード選択ラジオの監視（DOMContentLoaded にも対応）
function setupModeListener() {
  const modeInputs = document.querySelectorAll('input[name="mode"]');
  if (!modeInputs || modeInputs.length === 0) {
    console.warn('モード選択UIが見つかりません（input[name="mode"]）');
    return;
  }
  modeInputs.forEach(el => {
    el.addEventListener('change', (e) => {
      mode = e.target.value;
      console.log('モード切替:', mode);
    });
  });
  // 初期値（checked があれば）
  const checked = document.querySelector('input[name="mode"]:checked');
  if (checked) mode = checked.value;
}

// DOM 準備が完了したらモード監視をセット
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupModeListener);
} else {
  setupModeListener();
}

// ゲームクリア演出関数
function showWinMessage(text, isPlayer = true) {
  const msgEl = document.getElementById('message');
  msgEl.textContent = text;
  msgEl.classList.add('win'); // CSSでポップアニメーション

  // 背景色を一瞬変える
  if (isPlayer) {
    document.body.style.backgroundColor = "#d4edda"; // 緑っぽい
  } else {
    document.body.style.backgroundColor = "#f8d7da"; // 赤っぽい
  }

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
  const guess = inputEl.value; if (guess.length !== 3) {
     alert("3桁の数字を入力してください"); 
     return; 
  }

  playerAttempts++; 
  const hint = getHint(guess); 
  addHistory('あなた', guess, hint);

  if (hint === '◎◎◎') { 
    showWinMessage("🎉 あなたの勝利！おめでとう！ 🎉", true); 
    return; 
  }

  document.getElementById('message').textContent = "CPUのターンです！"; 
  turn = 'cpu';

  // 入力欄をクリア & フォーカス戻す 
  inputEl.value = ""; 
  inputEl.focus();

  setTimeout(cpuTurn, 1000); // 1秒後にCPUが挑戦
});

// --- CPUのターン（mode によって分岐） ---
function cpuTurn() {
  let guess;
  if (document.querySelector('input[name="mode"]:checked').value === 'easy') {
    guess = cpuGuessEasy();
  } else {
    guess = cpuGuessHard();
  }

  cpuAttempts++;
  const hint = getHint(guess);
  addHistory('CPU', guess, hint);

  if (hint === '◎◎◎') {
    showWinMessage("💻 CPUの勝利！", false);
    turn = '';
    return;
  }

  document.getElementById('message').textContent = "あなたのターンです！";
  turn = 'player';
  document.getElementById('guessInput').focus();
}

// --- CPU（イージー：ランダム） ---
function cpuGuessEasy() {
  let digits = ['0','1','2','3','4','5','6','7','8','9'];
  let guess = '';
  while (guess.length < 3) {
    let idx = Math.floor(Math.random() * digits.length);
    guess += digits[idx];
    digits.splice(idx, 1);
  }
  return guess;
}

function cpuGuessHard() {
  // 3桁の全組み合わせ（0-9, 重複なし）
  let candidates = [];
  const digits = ['0','1','2','3','4','5','6','7','8','9'];
  for (let i=0; i<digits.length; i++) {
    for (let j=0; j<digits.length; j++) {
      if (j === i) continue;
      for (let k=0; k<digits.length; k++) {
        if (k === i || k === j) continue;
        candidates.push(digits[i] + digits[j] + digits[k]);
      }
    }
  }

  // 過去履歴の「×」を反映して候補削除
  historyData.forEach(entry => {
    const guess = entry.guess;
    const hint = entry.hint;

    for (let i = 0; i < 3; i++) {
      const h = hint[i];
      const g = guess[i];

      if (h === '×') {
        // ×: 含む候補を削除
        candidates = candidates.filter(c => !c.includes(g));
      } else if (h === '◎') {
        // ◎: その位置の数字以外は削除
        candidates = candidates.filter(c => c[i] === g);
      } else if (h === '○') {
        // ○: 数字は含むが位置が違う
        candidates = candidates.filter(c => c.includes(g) && c[i] !== g);
      }
    }
  });

  // 候補が残っていなければ Easy fallback
  if (candidates.length === 0) return cpuGuessEasy();

  // 候補からランダムに1つ選択
  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx];
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

  historyData.push({player, guess, hint});
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