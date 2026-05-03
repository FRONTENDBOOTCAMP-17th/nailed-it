# Nailed IT API 사용 가이드

> Nailed IT 프론트엔드에서 백엔드 API를 호출하는 방법을 설명합니다.

---

## 기본 정보

| 항목             | 값                                                 |
| ---------------- | -------------------------------------------------- |
| **Base URL**     | `https://api.fullstackfamily.com/api/nailed-it/v1` |
| **인증 방식**    | JWT Bearer Token                                   |
| **Content-Type** | `application/json`                                 |

### 테스트 계정

| 구분        | 이메일            | 비밀번호    |
| ----------- | ----------------- | ----------- |
| 관리자      | `admin@nailed.it` | `boss-520!` |
| 일반 사용자 | `user1@nailed.it` | `User1234!` |

### API 문서 (직접 테스트 가능)

https://www.fullstackfamily.com/nailed-it/api-docs

위 페이지에서 모든 API를 직접 호출하고 응답을 확인할 수 있습니다.

---

## 응답 형식

모든 API 응답은 아래 형태입니다.

```json
// 성공
{
  "success": true,
  "message": "성공 메시지",
  "data": { ... }
}

// 실패
{
  "success": false,
  "message": "에러 메시지",
  "error": "ERROR_CODE"
}
```

---

## 준비: API 호출 함수 만들기

프로젝트의 `js/` 폴더에 `api.js` 파일을 만들어서, 반복되는 코드를 줄여봅시다.

### `js/api.js`

```js
// ============================================
// Nailed IT API 호출 유틸리티
// ============================================

// API 서버 주소
const BASE_URL = "https://api.fullstackfamily.com/api/nailed-it/v1";

// ── localStorage에 토큰 저장/가져오기 ──

// 토큰 저장
function saveToken(token) {
  localStorage.setItem("nit-token", token);
}

// 토큰 가져오기
function getToken() {
  return localStorage.getItem("nit-token");
}

// 토큰 삭제 (로그아웃 시)
function removeToken() {
  localStorage.removeItem("nit-token");
}

// ── API 호출 함수 ──

// 인증 없이 호출 (회원가입, 로그인 등)
async function apiPublic(method, path, body = null) {
  const options = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // body가 있으면 JSON으로 변환해서 넣기
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(BASE_URL + path, options);
  const data = await response.json();

  return data;
}

// 인증이 필요한 호출 (퀴즈, 세션 등)
async function api(method, path, body = null) {
  const token = getToken();

  const options = {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(BASE_URL + path, options);
  const data = await response.json();

  // 토큰 만료 시 로그인 페이지로 이동
  if (response.status === 401) {
    removeToken();
    alert("로그인이 필요합니다.");
    // 로그인 페이지로 이동하는 코드를 여기에 추가하세요
  }

  return data;
}

// 다른 파일에서 사용할 수 있도록 export
export { BASE_URL, saveToken, getToken, removeToken, apiPublic, api };
```

---

## 1. 회원가입

```js
import { apiPublic } from "./api.js";

// 회원가입 폼 제출 시
async function signup(nickname, email, password) {
  const result = await apiPublic("POST", "/auth/signup", {
    nickname: nickname, // 1~10자, 특수문자는 - _ . 만 가능
    email: email, // 이메일 형식
    password: password, // 8자 이상, 영문 + 숫자 + 특수문자 각 1개 이상
  });

  if (result.success) {
    alert("회원가입이 완료되었습니다! 로그인해주세요.");
    // 로그인 페이지로 이동
  } else {
    alert(result.message); // "이미 존재하는 이메일입니다." 등
  }
}
```

---

## 2. 로그인

```js
import { apiPublic, saveToken } from "./api.js";

async function login(email, password) {
  const result = await apiPublic("POST", "/auth/login", {
    email: email,
    password: password,
  });

  if (result.success) {
    // 토큰을 localStorage에 저장
    saveToken(result.data.token);

    // 사용자 정보
    console.log("닉네임:", result.data.nickname);
    console.log("역할:", result.data.role); // "admin" 또는 "user"

    // 역할에 따라 다른 페이지로 이동
    if (result.data.role === "admin") {
      // 관리자 페이지로 이동
    } else {
      // 홈 화면으로 이동
    }
  } else {
    alert(result.message); // "이메일 또는 비밀번호가 일치하지 않습니다."
  }
}
```

---

## 3. 로그아웃

```js
import { apiPublic, removeToken } from "./api.js";

async function logout() {
  await apiPublic("POST", "/auth/logout");
  removeToken();
  // 로그인 페이지로 이동
}
```

---

## 4. 내 정보 조회

```js
import { api } from "./api.js";

async function getMyInfo() {
  const result = await api("GET", "/users/me");

  if (result.success) {
    console.log("ID:", result.data.id);
    console.log("닉네임:", result.data.nickname);
    console.log("이메일:", result.data.email);
    console.log("역할:", result.data.role);
  }
}
```

---

## 5. 카테고리 목록 조회

```js
import { api } from "./api.js";

async function getCategories() {
  const result = await api("GET", "/categories");

  if (result.success) {
    // result.data = [
    //   { id: 1, name: "html", label: "HTML", sortOrder: 1 },
    //   { id: 2, name: "css",  label: "CSS",  sortOrder: 2 },
    //   { id: 3, name: "js",   label: "JavaScript", sortOrder: 3 }
    // ]

    result.data.forEach(function (category) {
      console.log(category.label); // "HTML", "CSS", "JavaScript"
    });
  }
}
```

---

## 6. 퀴즈 세션 (핵심 흐름!)

퀴즈 풀기의 전체 흐름은 이렇습니다:

```
1. 카테고리 선택 (예: "html")
2. 세션 생성 → 10문제가 배정됨
3. 문제를 하나씩 가져와서 풀기
4. 답안 제출 → 바로 정답/해설 확인
5. 10문제 다 풀면 → 결과 페이지
```

### 6-1. 세션 생성 (퀴즈 시작)

```js
import { api } from "./api.js";

async function startQuiz(categoryName) {
  // categoryName: "html", "css", "js" 중 하나
  const result = await api("POST", "/sessions", {
    category: categoryName,
  });

  if (result.success) {
    const sessionId = result.data.sessionId;
    const quizIds = result.data.quizIds; // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const total = result.data.totalQuizzes; // 10

    console.log("세션 ID:", sessionId);
    console.log("문제 수:", total);
    console.log("문제 ID 목록:", quizIds);

    // sessionId와 quizIds를 저장해두세요 (세션 스토리지 등)
    sessionStorage.setItem("sessionId", sessionId);
    sessionStorage.setItem("quizIds", JSON.stringify(quizIds));
    sessionStorage.setItem("currentIndex", 0); // 현재 몇 번째 문제인지

    return { sessionId, quizIds };
  } else {
    alert(result.message);
  }
}
```

### 6-2. 문제 가져오기

```js
import { api } from "./api.js";

async function getQuiz(quizId) {
  const result = await api("GET", "/quizzes/" + quizId);

  if (result.success) {
    // result.data 예시:
    // {
    //   id: 1,
    //   title: "HTML 문서 기본 구조",
    //   category: "html",
    //   question: "HTML 문서의 최상위 요소는?",
    //   options: ["<html>", "<head>", "<body>", "<div>"],
    //   difficulty: "easy"
    // }
    // ⚠️ 정답(answer)과 해설(explanation)은 포함되지 않습니다!

    return result.data;
  }
}

// 사용 예시: quizIds 배열에서 순서대로 문제 가져오기
async function loadCurrentQuiz() {
  const quizIds = JSON.parse(sessionStorage.getItem("quizIds"));
  const currentIndex = Number(sessionStorage.getItem("currentIndex"));

  const quizId = quizIds[currentIndex];
  const quiz = await getQuiz(quizId);

  // quiz.title      → 제목
  // quiz.question   → 문제 텍스트
  // quiz.options    → 보기 배열 (4개)
  // quiz.difficulty → 난이도 ("easy", "medium", "hard")

  return quiz;
}
```

### 6-3. 답안 제출 (즉시 채점)

```js
import { api } from "./api.js";

// selectedIndex: 사용자가 선택한 보기 번호 (0, 1, 2, 3)
// 스킵하려면 null을 보내세요
async function submitAnswer(quizId, selectedIndex) {
  const sessionId = sessionStorage.getItem("sessionId");

  const result = await api("POST", "/sessions/" + sessionId + "/answers", {
    quizId: quizId,
    selectedIndex: selectedIndex, // 0~3 또는 null(스킵)
  });

  if (result.success) {
    // result.data 예시:
    // {
    //   quizId: 1,
    //   correct: true,       ← 정답 여부
    //   answer: 0,           ← 실제 정답 번호
    //   explanation: "...",   ← 해설
    //   skipped: false        ← 스킵 여부
    // }

    if (result.data.correct) {
      console.log("정답입니다!");
    } else {
      console.log("틀렸습니다!");
      console.log("정답:", result.data.answer, "번");
      console.log("해설:", result.data.explanation);
    }

    // 다음 문제로 이동
    const currentIndex = Number(sessionStorage.getItem("currentIndex"));
    sessionStorage.setItem("currentIndex", currentIndex + 1);

    return result.data;
  } else {
    alert(result.message);
    // "이미 답안을 제출한 퀴즈입니다." (409) 등
  }
}
```

### 6-4. 세션 결과 조회 (10문제 모두 풀고 나서)

```js
import { api } from "./api.js";

async function getSessionResult() {
  const sessionId = sessionStorage.getItem("sessionId");

  const result = await api("GET", "/sessions/" + sessionId);

  if (result.success) {
    const data = result.data;

    console.log("카테고리:", data.category);
    console.log("점수:", data.score, "/", data.totalQuizzes);
    console.log("완료 시간:", data.completedAt);

    // 틀린 문제만 필터링
    const wrongAnswers = data.answers.filter(function (answer) {
      return answer.correct === false;
    });

    console.log("틀린 문제 수:", wrongAnswers.length);

    // 틀린 문제 해설 출력
    wrongAnswers.forEach(function (answer) {
      console.log("---");
      console.log("문제:", answer.question);
      console.log("내 답:", answer.selectedIndex, "/ 정답:", answer.answer);
      console.log("해설:", answer.explanation);
    });

    return data;
  }
}
```

---

## 7. 세션 히스토리 (과거 풀이 기록)

```js
import { api } from "./api.js";

// 모든 히스토리 조회
async function getHistory(page = 1) {
  const result = await api("GET", "/sessions?page=" + page + "&limit=10");

  if (result.success) {
    // result.data.sessions = [
    //   { sessionId: 3, category: "js",  score: 8, totalQuizzes: 10, ... },
    //   { sessionId: 2, category: "css", score: 6, totalQuizzes: 10, ... },
    //   { sessionId: 1, category: "html", score: 7, totalQuizzes: 10, ... }
    // ]

    result.data.sessions.forEach(function (session) {
      console.log(
        session.category + " - " + session.score + "/" + session.totalQuizzes,
      );
    });
  }
}

// 특정 카테고리만 필터링
async function getHistoryByCategory(categoryName) {
  const result = await api(
    "GET",
    "/sessions?category=" + categoryName + "&page=1&limit=10",
  );

  return result.data;
}
```

---

## 8. 관리자 전용 API (role이 "admin"일 때만!)

### 8-1. 퀴즈 목록 조회

```js
import { api } from "./api.js";

async function getAdminQuizList(category = "", page = 1) {
  let path = "/admin/quizzes?page=" + page + "&limit=10";

  if (category) {
    path += "&category=" + category;
  }

  const result = await api("GET", path);

  if (result.success) {
    const quizzes = result.data.quizzes;
    const total = result.data.total;

    console.log("전체 문제 수:", total);
    quizzes.forEach(function (quiz) {
      console.log(quiz.id, quiz.title, quiz.difficulty, quiz.status);
    });
  }
}
```

### 8-2. 퀴즈 등록

```js
import { api } from "./api.js";

async function createQuiz() {
  const result = await api("POST", "/admin/quizzes", {
    title: "블록 레벨 요소",
    category: "html",
    question: "다음 중 블록 레벨 요소가 아닌 것은?",
    options: ["<div>", "<p>", "<span>", "<h1>"],
    answer: 2, // 정답 인덱스 (0부터 시작) → <span>
    explanation: "<span>은 인라인 요소입니다.",
    difficulty: "easy", // "easy", "medium", "hard"
  });

  if (result.success) {
    console.log("퀴즈가 등록되었습니다! ID:", result.data.id);
  }
}
```

### 8-3. 퀴즈 수정

```js
import { api } from "./api.js";

async function updateQuiz(quizId) {
  // 변경하고 싶은 필드만 보내면 됩니다
  const result = await api("PATCH", "/admin/quizzes/" + quizId, {
    title: "수정된 제목",
    difficulty: "hard",
  });

  if (result.success) {
    console.log("퀴즈가 수정되었습니다!");
  }
}
```

### 8-4. 퀴즈 삭제

```js
import { api } from "./api.js";

async function deleteQuiz(quizId) {
  const result = await api("DELETE", "/admin/quizzes/" + quizId);

  if (result.success) {
    console.log("퀴즈가 삭제되었습니다!");
  }
}
```

---

## 전체 퀴즈 풀기 흐름 예시

아래는 HTML 카테고리 퀴즈를 처음부터 끝까지 푸는 전체 흐름입니다.

```js
import { api, apiPublic, saveToken } from "./api.js";

// 1단계: 로그인
const loginResult = await apiPublic("POST", "/auth/login", {
  email: "user1@nailed.it",
  password: "User1234!",
});
saveToken(loginResult.data.token);

// 2단계: 세션 생성 (HTML 카테고리)
const sessionResult = await api("POST", "/sessions", {
  category: "html",
});
const sessionId = sessionResult.data.sessionId;
const quizIds = sessionResult.data.quizIds;

// 3단계: 10문제 순서대로 풀기
for (let i = 0; i < quizIds.length; i++) {
  // 문제 가져오기
  const quizResult = await api("GET", "/quizzes/" + quizIds[i]);
  const quiz = quizResult.data;

  console.log("문제 " + (i + 1) + ": " + quiz.question);
  quiz.options.forEach(function (option, index) {
    console.log("  " + index + ") " + option);
  });

  // 답안 제출 (여기서는 예시로 0번 선택)
  const answerResult = await api(
    "POST",
    "/sessions/" + sessionId + "/answers",
    {
      quizId: quizIds[i],
      selectedIndex: 0,
    },
  );

  if (answerResult.data.correct) {
    console.log("  → 정답!");
  } else {
    console.log("  → 오답! 정답:", answerResult.data.answer);
    console.log("  → 해설:", answerResult.data.explanation);
  }
}

// 4단계: 최종 결과 확인
const finalResult = await api("GET", "/sessions/" + sessionId);
console.log(
  "최종 점수:",
  finalResult.data.score + "/" + finalResult.data.totalQuizzes,
);
```

---

## 에러 코드 정리

| HTTP 코드 | 의미        | 언제 발생하나?                                              |
| --------- | ----------- | ----------------------------------------------------------- |
| `400`     | 잘못된 요청 | 필수 값을 안 보냈을 때, 세션에 없는 quizId로 답안 제출      |
| `401`     | 인증 실패   | 토큰이 없거나 만료됨, 로그인 정보 틀림                      |
| `403`     | 권한 없음   | 일반 사용자가 관리자 API 호출, 다른 사람의 세션 접근        |
| `404`     | 없음        | 존재하지 않는 퀴즈 ID, 퀴즈 0개인 카테고리로 세션 생성      |
| `409`     | 중복        | 이미 있는 이메일/닉네임으로 가입, 같은 문제에 답 두 번 제출 |

---

## 참고

- **API 문서 페이지**: https://www.fullstackfamily.com/nailed-it/api-docs
- **API 요구사항 명세서**: `NAILED_IT_API.md`
