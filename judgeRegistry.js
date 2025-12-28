import { xToValue } from "./renderBoard.js";
/*
export const JudgeRegistry = {
  NAT_LINE: judgeInteger_line,
  INT_LINE: judgeInteger_line,
  RATIONAL_LINE: judgeInteger_line,
          // 유리수 전체
  RATIONAL_FINITE_LINE: judgeRationalFinite,   // 유한소수
  RATIONAL_INFINITE_LINE: judgeRationalInfinite, // 무한소수
  IRRATIONAL_LINE: judgeIrrational, 
}

*/
export const JudgeRegistry = {
  // =====================
  // 카드판
  // =====================
  NAT_CARD: (args) => {
    if (args.token.value < 0) return false;
    return judgeIntegerCard(args);
  },

  INT_CARD: (args) => {
    return judgeIntegerCard(args);
  },

  // =====================
  // 수직선 (공통)
  // =====================
  NAT_LINE: judgeInteger_line,
  INT_LINE: judgeInteger_line,
  RATIONAL_LINE: judgeInteger_line,  //유리수 전체

  // =====================
  // 수직선 - 성질별 필터
  // =====================
  RATIONAL_FINITE_LINE: (args) => { //유한소수
    const info = args.token.com_raw;
    if (!info) return false;
    if (info.kind !== "rational") return false;
    if (info.decimalType !== "finite") return false;
    return judgeInteger_line(args);
  },

  RATIONAL_REPEAT_LINE: (args) => { //무한소수
    //if (!isRepeatingDecimal(args.token)) return false;
    //if (Number.isInteger(args.token.value)) return false; // 핵심
    const info = args.token.com_raw;
    if (!info) return false;
    if (info.kind !== "rational") return false;
    if (info.decimalType !== "infinite") return false;
    const token = args.token;
    const board = args.board;
    return judgeInteger_line({ token, board });
    },

  IRRATIONAL_LINE: (args) => {
  const { token, board } = args;
  if (token.com_raw?.kind !== "irrational") return false;

  const rect = token.getRect();
  if (!touchesNumberLine(rect, board)) return false;

  const value = token.value;
  if (value < board.min || value > board.max) return false;

  // ⭐ 핵심: 무리수도 사잇값 "칸"은 존재한다
  const intValue = Math.floor(value);
  const cellRect = getCellRect_line(intValue, board);

  console.log("INT CARD DEBUG judge 93", {
    tokenValue: value,
    tokenRaw:token.raw,
    boardId: board.id,
    boardMin: board.min,
    boardMax: board.max,
    rect,
    cellRect,
    fullyInside: rectFullyInside(rect, cellRect),
  });

  // ⭐ 정확한 위치가 아니라 "해당 구간 안에 있으면 OK"
  return rectFullyInside_line(rect, cellRect);
 }
 



};

// =====================
// 카드판 공통
// =====================
function judgeIntegerCard({ token, board }) {
  // ⭐ 핵심 가드: 유리수만 허용
  if (token.com_raw?.kind !== "rational") return false;
  if (!Number.isFinite(token.value)) return false;
  if (!Number.isInteger(token.value)) return false;
  const value = token.value; // ⭐ 추가
  if (value < board.min || value > board.max) return false;
  const tokenRect = token.getRect();
  const cellRect = getCellRect(value, board);
  // 🔍 핵심 디버그 (여기!)
  console.log("INT CARD DEBUG judge 93", {
    tokenValue: value,
    boardId: board.id,
    boardMin: board.min,
    boardMax: board.max,
    tokenRect,
    cellRect,
    fullyInside: rectFullyInside(tokenRect, cellRect),
  });




  return rectFullyInside(tokenRect, cellRect);
}

////////////카드 셀 카운드 카들셀은 width/(max-min+1)
function getCellRect(value, board) {
  const cellCount = board.max - board.min + 1;
  const cellWidth = board.width / cellCount;
  const index = value - board.min;

  return {
    x: board.x + index * cellWidth,
    y: board.y,
    width: cellWidth,
    height: board.height,
  };
}
// =====================
// 라인판  공통
// =====================
function judgeInteger_line({ token, board }) {
  const value = token.value;// 토큰값가져옴
  if (!Number.isFinite(token.value)) return false;
  if (Number.isInteger(token.value)) return false;
  const tokenRect = token.getRect();//토큰크기
  // 2️⃣ 가로선 접촉 판정 (⭐ 핵심)
  const onLine = touchesNumberLine(tokenRect, board);
  if (!onLine) return false;
  const int_value = Math.floor(token.value);//정수부분
  const cellRect = getCellRect_line(int_value, board);//셀에서의 위치값
  
  return rectFullyInside_line(tokenRect, cellRect);
}
/////수직선셀 은 앞뒤로 반칸을 빼야 한다 
function getCellRect_line(value, board){ //(토큰정수만,보드)
  const cellCount = (board.max - board.min+1)*2;
  const cellWidth = board.width / cellCount;//한셀의 길이
  //const int_value = Math.trunc(value);
  const index_num = value - board.min;//보더의 위치

  const input_x = board.x + cellWidth + cellWidth * 2*index_num;
  const out_x = input_x + 2*cellWidth;
  console.log("ttttttt",{
    inputX: input_x,
    out_x : out_x,
    y: board.y,
    width: cellWidth,
    height: board.height,
  }); 
  return{
    x: input_x,
    y: board.y,
    width: 2*cellWidth,
    height: board.height,
  } 
}
////////////////////////////////////
function rectFullyInside_line(inner, outer) {
  return (
    inner.x > outer.x &&
    inner.y > outer.y &&
    inner.x + inner.width < outer.x + outer.width &&
    inner.y + inner.height < outer.y + outer.height
  );
}

function rectFullyInside(inner, outer) {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

// =====================
// 수직선 판정 (최종본)
// =====================
function judgeNumberLineNonInteger({ token, board }) {
  // 1️⃣ 값 유효성
  if (!Number.isFinite(token.value)) return false;
  if (Number.isInteger(token.value)) return false;

  const rect = token.getRect();

  // 2️⃣ 가로선 접촉
  const onLine = touchesNumberLine(rect, board);

  // 3️⃣ 토큰 중심 → 값
  const centerX = rect.x + rect.width / 2;
  const v = xToValue(centerX, board);

  // 4️⃣ 정수부 비교
  const tokenInt = Math.floor(token.value);
  const posInt = Math.floor(v);

  const result =
    onLine &&
    v >= board.min &&
    v <= board.max &&
    !Number.isInteger(v) &&
    tokenInt === posInt;

  // =========================
  // 🔍 DEBUG LOG
  // =========================
  console.log(token.com_raw);
  console.log(
    `[JUDGE:LINE] ${board.id}`,
    {
      tokenValue: token.value,
      tokenInt,
      positionValue: v,
      positionInt: posInt,
      onLine,
      boardMin: board.min,
      boardMax: board.max,
      result,
    }
  );

  return result;
}


// =====================
// 가로선 접촉 판정
// =====================
function touchesNumberLine(tokenRect, board) {
  const lineY = board.y + board.height / 2;
  return (
    tokenRect.y <= lineY &&
    tokenRect.y + tokenRect.height >= lineY
  );
}
/////////////////////////////
////////슬롯계산 함수
/*function rectToSlotRange(rect, board) {
  const slotWidth = board.width / ((board.max - board.min) * 2);
  const leftSlot  = Math.floor((rect.x - board.x) / slotWidth);
  const rightSlot = Math.floor((rect.x + rect.width - board.x) / slotWidth);
  return { leftSlot, rightSlot };
}
*/
//////////////수 조건 확인함수 집합///////
function isRepeatingDecimal(token) {
  if (!token.raw) return false;
  return token.raw.includes("(") && token.raw.includes(")");
}

function isFiniteDecimal(token) {
  return (
    token.com_raw?.kind === "rational" &&
    token.com_raw?.decimalType === "finite"
  );
}

function isIrrational(token) {
  if (!token.raw) return false;
  return ["√", "pi", "π", "e"].some(sym =>
    token.raw.includes(sym)
  );
}

function judgeRationalInfinite({ token }) {
  return (
    token.com_raw?.kind === "rational" &&
    token.com_raw?.decimalType === "infinite"
  );
}


