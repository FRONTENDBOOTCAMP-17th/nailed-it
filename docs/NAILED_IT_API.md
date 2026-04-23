# 🖥 NAILED IT — API 요구사항 명세서

> 바닐라 JS (Vite + Tailwind CSS) + REST API · 역할 분리 (관리자 · 일반 유저)

---

## 1. 프로젝트 개요

HTML · CSS · JavaScript 개념을 퀴즈로 학습하는 웹 애플리케이션.
관리자가 문제를 등록·수정·삭제하고, 일반 유저는 카테고리별로 퀴즈를 풀고 정답과 해설을 확인하는 구조.

| 구분 | 관리자 계정                     | 일반 유저                         |
| ---- | ------------------------------- | --------------------------------- |
| 권한 | 퀴즈 등록 · 수정 · 삭제         | 퀴즈 풀기 + 즉시 채점 (세션 기반) |
|      | 카테고리 지정 (HTML · CSS · JS) | 정답 · 해설 확인                  |
|      | 정답 및 해설 등록               | 풀이 기록 및 히스토리 조회        |
|      | 전체 퀴즈 관리 페이지 접근      |                                   |

---

## 2. 공통 기술 규약

| 항목         | 내용                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| Base URL     | `https://api.nailedit.com` (예시 URL, 변경 가능)                                           |
| Content-Type | `application/json`                                                                         |
| 인증 방식    | JWT Bearer Token — `Authorization: Bearer {token}` (localStorage 저장)                     |
| 관리자 판별  | 로그인 응답의 `role` 필드가 `"admin"`이면 관리자 메뉴로 이동                               |
| 관리자 계정  | email: `admin@nailed.it` / password: `boss-520!` / name: `Boss🐱` (서버 세팅 후 삭제 예정) |
| 관리자 API   | `/admin` prefix 사용 — 일반 사용자 API와 경로로 구분 (예: `/admin/quizzes`)                |
| 날짜 형식    | ISO 8601 (예: `2026-04-07T12:00:00Z`)                                                      |
| 카테고리     | `GET /categories` 응답값 기준으로 동적 관리 — 하드코딩 없이 확장 가능                      |

---

## 3. 인증 API (Auth)

### 3-1. 회원가입

```
POST /auth/signup
인증: 불필요
```

**Request Body**

| 필드     | 타입   | 필수 | 유효성 검사 및 제약 조건                                     | 비고                    |
| -------- | ------ | ---- | ------------------------------------------------------------ | ----------------------- |
| nickname | string | ✅   | 1~10자 / 특수문자 `- _ .` 만 허용 / 중복 불가                | 사용자 이름             |
| email    | string | ✅   | 이메일 형식 준수 / 중복 불가                                 | 로그인 ID로 사용        |
| password | string | ✅   | 최소 8자 이상 / 영문 · 숫자 · 특수문자 각 1개 이상 필수 포함 | 보안을 위한 암호화 저장 |

> 📌 이용약관 동의 체크박스는 프론트엔드에서만 처리하며 API로 전송하지 않습니다.

**Response (201)**

| 필드      | 타입   | 설명             |
| --------- | ------ | ---------------- |
| id        | number | 생성된 사용자 ID |
| nickname  | string | 사용자 이름      |
| email     | string | 이메일           |
| createdAt | string | 가입 일시        |

> ⚠️ 이미 존재하는 이메일 또는 닉네임으로 가입 시 `409 Conflict` 반환

---

### 3-2. 로그인

```
POST /auth/login
인증: 불필요
```

**Request Body**

| 필드     | 타입   | 필수 | 설명             |
| -------- | ------ | ---- | ---------------- |
| email    | string | ✅   | 이메일 형식 준수 |
| password | string | ✅   | 필수 입력        |

> 📌 로그인 상태 유지 체크박스는 프론트엔드에서만 처리하며 API로 전송하지 않습니다.

**Response (200)**

| 필드     | 타입   | 설명                           |
| -------- | ------ | ------------------------------ |
| token    | string | JWT 토큰 (localStorage에 저장) |
| id       | number | 사용자 ID                      |
| nickname | string | 사용자 이름                    |
| role     | string | `"user"` 또는 `"admin"`        |
| email    | string | 사용자 이메일                  |

> 📌 `role` 값으로 이동 화면을 결정합니다.
>
> - `"user"` → 홈 화면으로 이동
> - `"admin"` → 문제 관리(목록) 페이지로 이동
>
> ⚠️ email 또는 password 불일치 시 `401 Unauthorized` 반환

---

### 3-3. 로그아웃

```
POST /auth/logout
인증: 불필요
```

**Request Body:** 없음

**Response (200)**

| 필드    | 타입   | 설명                    |
| ------- | ------ | ----------------------- |
| message | string | `"로그아웃 되었습니다"` |

---

## 4. 사용자 API (Users)

### 4-1. 내 정보 조회

```
GET /users/me
인증: 필요 (JWT)
```

로그인 직후 호출하여 `role` 값으로 관리자 여부를 판별합니다.

**Request Body:** 없음

**Response (200)**

| 필드     | 타입   | 설명                    |
| -------- | ------ | ----------------------- |
| id       | number | 사용자 ID               |
| nickname | string | 사용자 이름             |
| email    | string | 이메일                  |
| role     | string | `"admin"` 또는 `"user"` |

---

## 5. 카테고리 API (Categories)

### 5-1. 카테고리 목록 조회

```
GET /categories
인증: 필요 (JWT)
```

페이지 로드 시 호출하여 카테고리 필터 탭과 퀴즈 등록·수정 폼의 선택지를 동적으로 렌더링합니다.
카테고리가 추가되거나 변경되어도 프론트엔드 코드 수정 없이 자동 반영됩니다.

**Request Body:** 없음

**Response (200)**

| 필드               | 타입   | 설명                                  |
| ------------------ | ------ | ------------------------------------- |
| categories[]       | array  | 카테고리 목록                         |
| categories[].id    | number | 카테고리 ID                           |
| categories[].name  | string | API 요청에 사용하는 값 (예: `"html"`) |
| categories[].label | string | 화면에 표시하는 텍스트 (예: `"HTML"`) |

**Response Example**

```json
{
  "categories": [
    { "id": 1, "name": "html", "label": "HTML" },
    { "id": 2, "name": "css", "label": "CSS" },
    { "id": 3, "name": "js", "label": "JavaScript" }
  ]
}
```

> 📌 `name` → `?category=` 쿼리 파라미터에 사용
> 📌 `label` → 필터 탭·드롭다운 등 화면 표시에 사용

---

## 6. 퀴즈 API (Quizzes)

### 6-1. 퀴즈 목록 조회 (관리자 전용)

```
GET /admin/quizzes?category=html&page=1&limit=10
인증: 필요 (JWT · 관리자만)
```

**Query Parameters**

| 파라미터 | 타입   | 필수 | 설명                                                |
| -------- | ------ | ---- | --------------------------------------------------- |
| category | string | ❌   | `GET /categories`의 `name` 값 중 하나 (없으면 전체) |
| page     | number | ❌   | 페이지 번호 (기본값: 1)                             |
| limit    | number | ❌   | 페이지당 개수 (기본값: 10)                          |

**Response (200)**

| 필드                 | 타입   | 설명                                      |
| -------------------- | ------ | ----------------------------------------- |
| quizzes[]            | array  | 퀴즈 목록                                 |
| quizzes[].id         | number | 퀴즈 ID                                   |
| quizzes[].title      | string | 퀴즈 제목                                 |
| quizzes[].category   | string | 카테고리                                  |
| quizzes[].difficulty | string | 난이도 (`"easy"` · `"medium"` · `"hard"`) |
| quizzes[].status     | string | `"published"` 또는 `"draft"`              |
| quizzes[].createdAt  | string | 등록 일시 (예: `2026-04-08T12:00:00Z`)    |
| total                | number | 전체 퀴즈 수                              |
| page                 | number | 현재 페이지                               |

> 📌 화면 표시 시 날짜만 잘라서 사용합니다. (YYYY-MM-DD)
> 📌 난이도는 문제 옆에 작은 배지(Badge) 형태로 표시

---

### 6-2. 퀴즈 상세 조회 — 사용자

```
GET /quizzes/:id
인증: 필요 (JWT)
```

> 📌 `answer`와 `explanation`은 응답에 포함되지 않습니다. 채점은 `POST /sessions/:sessionId/answers`를 사용합니다.

**Request Body:** 없음

**Response (200)**

| 필드       | 타입     | 설명            |
| ---------- | -------- | --------------- |
| id         | number   | 퀴즈 ID         |
| title      | string   | 퀴즈 제목       |
| category   | string   | 카테고리        |
| question   | string   | 문제 내용       |
| options    | string[] | 보기 배열 (4개) |
| difficulty | string   | 난이도          |

---

### ~~6-3. 퀴즈 채점~~ — 🚫 폐기됨

> ⚠️ `POST /quizzes/:id/submit`은 세션 도입으로 **폐기**되었습니다. `POST /sessions/:sessionId/answers`를 사용하세요.

| 항목       | 기존 (6-3) — 폐기          | 변경 (8-2) — 현행                               |
| ---------- | -------------------------- | ----------------------------------------------- |
| 엔드포인트 | `POST /quizzes/:id/submit` | `POST /sessions/:sessionId/answers`             |
| 중복 제출  | 퀴즈 단위 409 (영구 차단)  | 세션 내 퀴즈 단위 409 (새 세션에서 재풀이 가능) |
| 기록 저장  | 없음                       | 세션에 자동 저장                                |
| 재도전     | 불가                       | 새 세션 생성으로 가능                           |

---

### 6-4. 퀴즈 상세 조회 (관리자 전용)

```
GET /admin/quizzes/:id
인증: 필요 (JWT · 관리자만)
```

**Request Body:** 없음

**Response (200)**

| 필드        | 타입     | 설명                         |
| ----------- | -------- | ---------------------------- |
| id          | number   | 퀴즈 ID                      |
| title       | string   | 퀴즈 제목                    |
| category    | string   | 카테고리                     |
| question    | string   | 문제 내용                    |
| options     | string[] | 보기 배열 (4개)              |
| answer      | number   | 정답 인덱스 (0부터 시작)     |
| explanation | string   | 해설                         |
| status      | string   | `"published"` 또는 `"draft"` |
| createdAt   | string   | 등록 일시                    |

---

### 6-5. 퀴즈 등록 (관리자 전용)

```
POST /admin/quizzes
인증: 필요 (JWT · 관리자만)
```

**Request Body**

| 필드        | 타입     | 필수 | 설명                                     |
| ----------- | -------- | ---- | ---------------------------------------- |
| title       | string   | ✅   | 퀴즈 제목                                |
| category    | string   | ✅   | `GET /categories`의 `name` 값 중 하나    |
| question    | string   | ✅   | 문제 내용                                |
| options     | string[] | ✅   | 보기 배열 (항상 4개)                     |
| answer      | number   | ✅   | 정답 인덱스 (0부터 시작)                 |
| explanation | string   | ✅   | 해설                                     |
| difficulty  | string   | ✅   | `"easy"` · `"medium"` · `"hard"` 중 하나 |

**Response (201)**

| 필드      | 타입   | 설명           |
| --------- | ------ | -------------- |
| id        | number | 생성된 퀴즈 ID |
| status    | string | `"published"`  |
| createdAt | string | 생성 일시      |

> ⚠️ 관리자 계정이 아닌 경우 `403 Forbidden` 반환

---

### 6-6. 퀴즈 수정 (관리자 전용)

```
PATCH /admin/quizzes/:id
인증: 필요 (JWT · 관리자만)
```

**Request Body** (변경할 필드만 포함)

| 필드        | 타입     | 필수 | 설명                                  |
| ----------- | -------- | ---- | ------------------------------------- |
| title       | string   | ❌   | 수정할 제목                           |
| category    | string   | ❌   | `GET /categories`의 `name` 값 중 하나 |
| question    | string   | ❌   | 수정할 문제 내용                      |
| options     | string[] | ❌   | 수정할 보기 배열                      |
| answer      | number   | ❌   | 수정할 정답 인덱스                    |
| explanation | string   | ❌   | 수정할 해설                           |
| difficulty  | string   | ❌   | 수정할 난이도                         |

**Response (200)**

| 필드      | 타입   | 설명        |
| --------- | ------ | ----------- |
| id        | number | 퀴즈 ID     |
| title     | string | 수정된 제목 |
| updatedAt | string | 수정 일시   |

> ⚠️ 관리자 계정이 아닌 경우 `403 Forbidden` 반환

---

### 6-7. 퀴즈 삭제 (관리자 전용)

```
DELETE /admin/quizzes/:id
인증: 필요 (JWT · 관리자만)
```

> 📌 프론트엔드에서 삭제 버튼 클릭 시 확인 모달을 먼저 띄운 후, 관리자가 최종 확인했을 때만 이 API를 호출합니다.

**Request Body:** 없음

**Response (200)**

| 필드    | 타입   | 설명                      |
| ------- | ------ | ------------------------- |
| message | string | `"퀴즈가 삭제되었습니다"` |

> ⚠️ 관리자 계정이 아닌 경우 `403 Forbidden` 반환

---

## 7. 공통 에러 응답 코드

모든 에러 응답은 아래 형태로 반환됩니다.

```json
{ "error": "에러 메시지" }
```

| 코드  | 상태                  | 설명                     | 발생 예시                                                |
| ----- | --------------------- | ------------------------ | -------------------------------------------------------- |
| `400` | Bad Request           | 요청 형식 오류           | 필수 필드 누락, 세션에 없는 `quizId`로 답안 제출         |
| `401` | Unauthorized          | 인증 토큰 없음 또는 만료 | Authorization 헤더 미포함                                |
| `403` | Forbidden             | 권한 없음                | 일반 유저가 관리자 API 호출, 타인의 세션 접근            |
| `404` | Not Found             | 리소스 없음              | 잘못된 퀴즈 ID, 퀴즈 0개인 카테고리로 세션 생성          |
| `409` | Conflict              | 중복 리소스              | 이미 존재하는 이메일로 가입, 동일 세션 내 중복 답안 제출 |
| `500` | Internal Server Error | 서버 내부 오류           | 예상치 못한 서버 예외                                    |

---

## 8. 퀴즈 세션 API (Sessions)

세션(Session) 개념을 도입하여 10문제 단위 퀴즈 풀이, 풀이 기록 저장, 결과 조회, 재도전 기능을 지원합니다.

### 세션 흐름

```
1. 사용자가 카테고리 선택 (html / css / js)
       ↓
2. POST /sessions — 세션 생성, 해당 카테고리의 퀴즈를 등록 순서대로 배정
       ↓
3. 문제 풀이 루프 (10회 반복)
   ├─ GET /quizzes/:id — 문제 조회 (6-2)
   ├─ POST /sessions/:sessionId/answers — 답안 제출 → 즉시 정답·해설 반환
   └─ (스킵 시 selected_index: null 전송)
       ↓
4. GET /sessions/:sessionId — 결과 페이지 (전체 요약 + 틀린 문제 해설)
       ↓
5. 재도전 시 → 다시 POST /sessions (새 세션 생성, 이전 세션은 자동 아카이브)
```

---

### 8-1. 세션 생성 (퀴즈 시작)

```
POST /sessions
인증: 필요 (JWT)
```

사용자가 카테고리를 선택하고 퀴즈를 시작하면 호출합니다.
서버는 해당 카테고리의 `published` 상태 퀴즈를 등록 순서대로 배정하여 세션을 생성합니다.

**Request Body**

| 필드     | 타입   | 필수 | 설명                                  |
| -------- | ------ | ---- | ------------------------------------- |
| category | string | ✅   | `GET /categories`의 `name` 값 중 하나 |

**Response (201)**

| 필드         | 타입     | 설명                                |
| ------------ | -------- | ----------------------------------- |
| sessionId    | number   | 생성된 세션 ID                      |
| category     | string   | 선택한 카테고리                     |
| quizIds      | number[] | 배정된 퀴즈 ID 배열 (등록 순서대로) |
| totalQuizzes | number   | 배정된 문제 수 (10)                 |
| createdAt    | string   | 세션 생성 일시                      |

**Response Example**

```json
{
  "sessionId": 42,
  "category": "html",
  "quizIds": [3, 7, 12, 15, 21, 28, 33, 41, 45, 50],
  "totalQuizzes": 10,
  "createdAt": "2026-04-09T14:00:00Z"
}
```

> 📌 퀴즈는 `createdAt` 오름차순(등록 순서)으로 배정됩니다.
> 📌 프론트엔드는 `quizIds` 배열 순서대로 `GET /quizzes/:id`를 호출하여 문제를 표시합니다.
> ⚠️ 퀴즈가 0개인 카테고리로 요청 시 `404 Not Found` 반환

---

### 8-2. 답안 제출 (문제별 즉시 채점)

```
POST /sessions/:sessionId/answers
인증: 필요 (JWT)
```

한 문제를 풀 때마다 호출합니다. 서버가 채점 후 정답과 해설을 즉시 반환합니다.

**Request Body**

| 필드           | 타입           | 필수 | 설명                                                     |
| -------------- | -------------- | ---- | -------------------------------------------------------- |
| quizId         | number         | ✅   | 해당 세션에 배정된 퀴즈 ID                               |
| selected_index | number \| null | ✅   | 사용자가 선택한 보기 인덱스 (0부터 시작), 스킵 시 `null` |

**Response (200)**

| 필드        | 타입    | 설명                         |
| ----------- | ------- | ---------------------------- |
| quizId      | number  | 퀴즈 ID                      |
| correct     | boolean | 정답 여부 (`true` / `false`) |
| answer      | number  | 정답 인덱스 (0부터 시작)     |
| explanation | string  | 해설                         |
| skipped     | boolean | 스킵 여부                    |

**Response Example**

```json
{
  "quizId": 3,
  "correct": true,
  "answer": 2,
  "explanation": "<div>는 블록 레벨 요소입니다.",
  "skipped": false
}
```

> 📌 스킵한 문제(`selected_index: null`)는 `correct: false`, `skipped: true`로 반환됩니다.
> ⚠️ 해당 세션에 배정되지 않은 `quizId`로 요청 시 `400 Bad Request` 반환
> ⚠️ 같은 세션에서 이미 제출한 `quizId`로 다시 요청 시 `409 Conflict` 반환
> ⚠️ 본인의 세션이 아닌 경우 `403 Forbidden` 반환

---

### 8-3. 세션 결과 조회

```
GET /sessions/:sessionId
인증: 필요 (JWT)
```

10문제를 모두 풀고 결과 페이지에서 호출합니다.
맞힌 문제 요약과 틀린 문제의 해설을 함께 반환합니다.

**Request Body:** 없음

**Response (200)**

| 필드                     | 타입           | 설명                                    |
| ------------------------ | -------------- | --------------------------------------- |
| sessionId                | number         | 세션 ID                                 |
| category                 | string         | 카테고리                                |
| score                    | number         | 맞힌 문제 수                            |
| totalQuizzes             | number         | 전체 문제 수                            |
| completedAt              | string \| null | 세션 완료 일시 (진행 중이면 `null`)     |
| answers[]                | array          | 답안 목록 (출제 순서)                   |
| answers[].quizId         | number         | 퀴즈 ID                                 |
| answers[].title          | string         | 퀴즈 제목                               |
| answers[].question       | string         | 문제 내용                               |
| answers[].options        | string[]       | 보기 배열                               |
| answers[].selected_index | number \| null | 사용자가 선택한 인덱스 (스킵 시 `null`) |
| answers[].correct        | boolean        | 정답 여부                               |
| answers[].answer         | number         | 정답 인덱스                             |
| answers[].explanation    | string         | 해설                                    |
| answers[].skipped        | boolean        | 스킵 여부                               |

**Response Example**

```json
{
  "sessionId": 42,
  "category": "html",
  "score": 7,
  "totalQuizzes": 10,
  "completedAt": "2026-04-09T14:15:00Z",
  "answers": [
    {
      "quizId": 3,
      "title": "블록 레벨 요소",
      "question": "다음 중 블록 레벨 요소가 아닌 것은?",
      "options": ["<div>", "<p>", "<span>", "<h1>"],
      "selected_index": 2,
      "correct": true,
      "answer": 2,
      "explanation": "<span>은 인라인 요소입니다.",
      "skipped": false
    },
    {
      "quizId": 7,
      "title": "시맨틱 태그",
      "question": "시맨틱 태그의 역할은?",
      "options": ["스타일 지정", "의미 전달", "스크립트 실행", "데이터 저장"],
      "selected_index": null,
      "correct": false,
      "answer": 1,
      "explanation": "시맨틱 태그는 콘텐츠의 의미를 전달합니다.",
      "skipped": true
    }
  ]
}
```

> 📌 프론트엔드는 `correct: false`인 항목만 필터링하여 틀린 문제 해설을 표시합니다.
> 📌 아직 제출하지 않은 문제가 있으면 해당 항목은 `answers[]`에 포함되지 않습니다.
> ⚠️ 본인의 세션이 아닌 경우 `403 Forbidden` 반환

---

### 8-4. 세션 히스토리 조회

```
GET /sessions?category=html&page=1&limit=10
인증: 필요 (JWT)
```

사용자의 과거 퀴즈 풀이 기록을 최신순으로 조회합니다.

**Query Parameters**

| 파라미터 | 타입   | 필수 | 설명                                                |
| -------- | ------ | ---- | --------------------------------------------------- |
| category | string | ❌   | `GET /categories`의 `name` 값 중 하나 (없으면 전체) |
| page     | number | ❌   | 페이지 번호 (기본값: 1)                             |
| limit    | number | ❌   | 페이지당 개수 (기본값: 10)                          |

**Response (200)**

| 필드                    | 타입           | 설명                           |
| ----------------------- | -------------- | ------------------------------ |
| sessions[]              | array          | 세션 목록                      |
| sessions[].sessionId    | number         | 세션 ID                        |
| sessions[].category     | string         | 카테고리                       |
| sessions[].score        | number         | 맞힌 문제 수                   |
| sessions[].totalQuizzes | number         | 전체 문제 수                   |
| sessions[].completedAt  | string \| null | 완료 일시 (진행 중이면 `null`) |
| sessions[].createdAt    | string         | 세션 시작 일시                 |
| total                   | number         | 전체 세션 수                   |
| page                    | number         | 현재 페이지                    |

**Response Example**

```json
{
  "sessions": [
    {
      "sessionId": 42,
      "category": "html",
      "score": 7,
      "totalQuizzes": 10,
      "completedAt": "2026-04-09T14:15:00Z",
      "createdAt": "2026-04-09T14:00:00Z"
    },
    {
      "sessionId": 35,
      "category": "html",
      "score": 5,
      "totalQuizzes": 10,
      "completedAt": "2026-04-08T10:30:00Z",
      "createdAt": "2026-04-08T10:10:00Z"
    }
  ],
  "total": 2,
  "page": 1
}
```

> 📌 `completedAt`이 `null`인 세션은 진행 중인 세션입니다.
> 📌 재도전 시 이전 세션은 그대로 보존되며, 히스토리에서 모두 조회 가능합니다.

---

_— END OF DOCUMENT —_
