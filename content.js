// =============================================
// 한/영 키보드 레이아웃 매핑 테이블
// =============================================

const EN_TO_KO_MAP = {
  'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ',
  'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
  'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ',
  'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
  'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ', 'b': 'ㅠ',
  'n': 'ㅜ', 'm': 'ㅡ',
  'Q': 'ㅃ', 'W': 'ㅉ', 'E': 'ㄸ', 'R': 'ㄲ', 'T': 'ㅆ',
  'O': 'ㅒ', 'P': 'ㅖ'
};

const KO_JAMO_TO_EN_MAP = {};
for (const [en, ko] of Object.entries(EN_TO_KO_MAP)) {
  KO_JAMO_TO_EN_MAP[ko] = en;
}

// =============================================
// 한글 유니코드 상수 및 자모 목록
// =============================================

const HANGUL_START  = 0xAC00;
const HANGUL_END    = 0xD7A3;
const CHOSUNG_COUNT = 21 * 28;
const JUNGSUNG_COUNT = 28;

const CHOSUNG  = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNGSUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONGSUNG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

const CHOSUNG_SET  = new Set(CHOSUNG);
const JUNGSUNG_SET = new Set(JUNGSUNG);

// =============================================
// 겹모음 / 겹받침 조합 테이블
// =============================================

const COMPOUND_VOWELS = {
  'ㅗ+ㅏ': 'ㅘ', 'ㅗ+ㅐ': 'ㅙ', 'ㅗ+ㅣ': 'ㅚ',
  'ㅜ+ㅓ': 'ㅝ', 'ㅜ+ㅔ': 'ㅞ', 'ㅜ+ㅣ': 'ㅟ',
  'ㅡ+ㅣ': 'ㅢ'
};

const COMPOUND_CONSONANTS = {
  'ㄱ+ㅅ': 'ㄳ', 'ㄴ+ㅈ': 'ㄵ', 'ㄴ+ㅎ': 'ㄶ',
  'ㄹ+ㄱ': 'ㄺ', 'ㄹ+ㅁ': 'ㄻ', 'ㄹ+ㅂ': 'ㄼ',
  'ㄹ+ㅅ': 'ㄽ', 'ㄹ+ㅌ': 'ㄾ', 'ㄹ+ㅍ': 'ㄿ',
  'ㄹ+ㅎ': 'ㅀ', 'ㅂ+ㅅ': 'ㅄ'
};

// =============================================
// 한글 → 자모 분해
// =============================================

function decomposeHangul(char) {
  const code = char.charCodeAt(0);
  if (code < HANGUL_START || code > HANGUL_END) return [char];

  const offset = code - HANGUL_START;
  const cho  = Math.floor(offset / CHOSUNG_COUNT);
  const jung = Math.floor((offset % CHOSUNG_COUNT) / JUNGSUNG_COUNT);
  const jong = offset % JUNGSUNG_COUNT;

  return [CHOSUNG[cho], JUNGSUNG[jung], JONGSUNG[jong]].filter(Boolean);
}

// =============================================
// 자모 배열 → 한글 조합 (겹모음 / 겹받침 포함)
// =============================================

function composeHangul(jamos) {
  let result = '';
  let i = 0;

  while (i < jamos.length) {
    const cur = jamos[i];

    if (CHOSUNG_SET.has(cur) && CHOSUNG.includes(cur)) {
      const choIdx = CHOSUNG.indexOf(cur);

      if (i + 1 < jamos.length && JUNGSUNG_SET.has(jamos[i + 1])) {

        // ── 겹모음 체크 ──────────────────────────────
        let jungJamo    = jamos[i + 1];
        let jungConsumed = 1;

        const nextForCompound = jamos[i + 2];
        if (nextForCompound) {
          const compoundVowel = COMPOUND_VOWELS[jungJamo + '+' + nextForCompound];
          if (compoundVowel) {
            // 겹모음 뒤에 초성+중성이 이어지면 합치지 않음
            const afterCompound = jamos[i + 3];
            const isNextSyllable = afterCompound && JUNGSUNG_SET.has(afterCompound);
            if (!isNextSyllable) {
              jungJamo     = compoundVowel;
              jungConsumed = 2;
            }
          }
        }

        const jungIdx = JUNGSUNG.indexOf(jungJamo);
        if (jungIdx === -1) { result += cur; i++; continue; }

        // ── 종성 체크 (겹받침 포함) ──────────────────
        let jongIdx  = 0;
        let consumed = 1 + jungConsumed;

        const jongPos = i + 1 + jungConsumed;
        if (jongPos < jamos.length) {
          const cand1 = jamos[jongPos];
          const cand2 = jamos[jongPos + 1];

          // 겹받침 우선 시도
          if (cand2) {
            const compoundJong = COMPOUND_CONSONANTS[cand1 + '+' + cand2];
            if (compoundJong) {
              const afterJong = jamos[jongPos + 2];
              // 겹받침 다음에 중성이 오면 → 겹받침 분리 (다음 음절로)
              if (afterJong && JUNGSUNG_SET.has(afterJong)) {
                // 단일 종성만 시도
              } else {
                const possIdx = JONGSUNG.indexOf(compoundJong);
                if (possIdx > 0) {
                  jongIdx  = possIdx;
                  consumed = 1 + jungConsumed + 2;
                }
              }
            }
          }

          // 겹받침 없으면 단일 종성 시도
          if (jongIdx === 0) {
            const possIdx = JONGSUNG.indexOf(cand1);
            if (possIdx > 0) {
              const afterJong = jamos[jongPos + 1];
              // 종성 후보 다음에 중성이 오면 → 다음 음절의 초성
              if (afterJong && JUNGSUNG_SET.has(afterJong)) {
                // 종성 없음
              } else {
                jongIdx  = possIdx;
                consumed = 1 + jungConsumed + 1;
              }
            }
          }
        }

        const code = HANGUL_START
          + (choIdx  * CHOSUNG_COUNT)
          + (jungIdx * JUNGSUNG_COUNT)
          + jongIdx;
        result += String.fromCharCode(code);
        i += consumed;
        continue;
      }
    }

    result += cur;
    i++;
  }

  return result;
}

// =============================================
// 영어 → 한글 변환
// =============================================

function englishToKorean(text) {
  const jamos = [];
  for (const ch of text) {
    jamos.push(EN_TO_KO_MAP[ch] || ch);
  }
  return composeHangul(jamos);
}

// =============================================
// 한글 → 영어 변환
// =============================================

function koreanToEnglish(text) {
  let result = '';
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= HANGUL_START && code <= HANGUL_END) {
      for (const jamo of decomposeHangul(ch)) {
        result += KO_JAMO_TO_EN_MAP[jamo] || jamo;
      }
    } else if (KO_JAMO_TO_EN_MAP[ch]) {
      result += KO_JAMO_TO_EN_MAP[ch];
    } else {
      result += ch;
    }
  }
  return result;
}

// =============================================
// 언어 감지 및 변환 방향 결정
// =============================================

function detectAndConvert(text) {
  let koreanCount = 0;
  let englishCount = 0;

  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if ((code >= 0xAC00 && code <= 0xD7A3) ||
        (code >= 0x3131 && code <= 0x314E) ||
        (code >= 0x314F && code <= 0x3163)) {
      koreanCount++;
    } else if (/[a-zA-Z]/.test(ch)) {
      englishCount++;
    }
  }

  const total = koreanCount + englishCount;
  if (total === 0) return { converted: text, direction: null };

  if (koreanCount / total > 0.5) {
    return { converted: koreanToEnglish(text), direction: 'ko→en' };
  } else {
    return { converted: englishToKorean(text), direction: 'en→ko' };
  }
}

// =============================================
// 텍스트 교체
// =============================================

function replaceSelectedText(newText) {
  const activeEl = document.activeElement;

  if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
    const start    = activeEl.selectionStart;
    const end      = activeEl.selectionEnd;
    const original = activeEl.value;
    activeEl.value = original.slice(0, start) + newText + original.slice(end);
    activeEl.setSelectionRange(start, start + newText.length);
    activeEl.dispatchEvent(new Event('input',  { bubbles: true }));
    activeEl.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(newText));
    sel.collapseToEnd();
    return true;
  }

  return false;
}

// =============================================
// 토스트 알림
// =============================================

function showToast(original, converted, direction) {
  const existing = document.getElementById('keyboard-fixer-toast');
  if (existing) existing.remove();

  const dirLabel = direction === 'ko→en' ? '한글 → 영어' : '영어 → 한글';
  const arrow    = direction === 'ko→en' ? '🔤' : '🇰🇷';

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes slideOut { from { opacity:1; transform:translateY(0); } to { opacity:0; transform:translateY(12px); } }
  `;
  document.head.appendChild(style);

  const toast = document.createElement('div');
  toast.id = 'keyboard-fixer-toast';
  toast.style.cssText = `
    position:fixed; bottom:24px; right:24px;
    background:#1e1e2e; color:#cdd6f4;
    border:1px solid #45475a; border-radius:12px;
    padding:14px 18px; font-family:'Segoe UI',sans-serif;
    font-size:13px; max-width:320px;
    z-index:2147483647; box-shadow:0 8px 32px rgba(0,0,0,0.4);
    animation:slideIn 0.2s ease; line-height:1.5;
  `;
  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
      <span style="font-size:16px">${arrow}</span>
      <span style="font-weight:600;color:#89b4fa">${dirLabel} 변환 완료</span>
    </div>
    <div style="color:#a6adc8;font-size:12px;margin-bottom:4px">
      <span style="color:#f38ba8;text-decoration:line-through">${original.slice(0,30)}${original.length>30?'...':''}</span>
    </div>
    <div style="color:#a6e3a1;font-size:13px;font-weight:500">
      → ${converted.slice(0,30)}${converted.length>30?'...':''}
    </div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.2s ease forwards';
    setTimeout(() => toast.remove(), 200);
  }, 2500);
}

// =============================================
// 단축키 이벤트 리스너 (Ctrl+Shift+K)
// =============================================

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'K') {
    e.preventDefault();

    let selectedText = '';
    const activeEl = document.activeElement;

    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      selectedText = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
    }
    if (!selectedText) {
      selectedText = window.getSelection()?.toString() || '';
    }

    if (!selectedText.trim()) {
      showToast('', '먼저 변환할 텍스트를 드래그하세요', null);
      return;
    }

    const { converted, direction } = detectAndConvert(selectedText);

    if (!direction) {
      showToast(selectedText, '변환할 한/영 텍스트를 찾을 수 없습니다', null);
      return;
    }
    if (converted === selectedText) {
      showToast(selectedText, '이미 올바른 텍스트입니다', null);
      return;
    }

    replaceSelectedText(converted);
    showToast(selectedText, converted, direction);
  }
});
