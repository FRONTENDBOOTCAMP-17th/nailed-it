# 🖥 NAILED IT — 퀴즈 세션 API 추가 명세서

> 기존 `NAILEDIT_API.md`의 보충 문서 — 사용자의 퀴즈 풀이 기록을 세션 단위로 관리하기 위한 API

---

## 배경 및 문제점

기존 API(`POST /quizzes/submit`)는 퀴즈 단건 채점만 지원하며, 다음 기능이 누락되어 있습니다.

| 누락된 기능                        | 설명                                                        |
| ---------------------------------- | ----------------------------------------------------------- |
| 10문제 세션 관리                   | 사용자가 카테고리를 선택하고 10문제를 한 세트로 푸는 흐름   |
| 풀이 기록 저장                     | 어떤 문제를 맞췄고 틀렸는지 서버에 기록                     |
| 결과 페이지 데이터                 | 10문제 완료 후 정답/오답 요약 + 틀린 문제 해설 조회         |
| 재도전                             | 같은 카테고리를 다시 풀면 이전 기록은 아카이브, 새 세션 시작 |

이를 해결하기 위해 **퀴즈 세션(Session)** 개념을 도입합니다.

---

## 세션 흐름 요약

```
1. 사용자가 카테고리 선택 (html / css / js)
       ↓
2. POST /sessions — 세션 생성, 해당 카테고리의 퀴즈를 등록 순서대로 배정
       ↓
3. 문제 풀이 루프 (10회 반복)
   ├─ GET /quizzes/:id — 문제 조회 (기존 API 6-3)
   ├─ POST /sessions/:sessionId/answers — 답안 제출 → 즉시 정답·해설 반환
   └─ (스킵 시 selected_index: null 전송)
       ↓
4. GET /sessions/:sessionId — 결과 페이지 (전체 요약 + 틀린 문제 해설)
       ↓
5. 재도전 시 → 다시 POST /sessions (새 세션 생성, 이전 세션은 자동 아카이브)
```

---

## 8. 퀴즈 세션 API (Sessions)

### 8-1. 세션 생성 (퀴즈 시작)

```
POST /sessions
인증: 필요 (JWT)
```

사용자가 카테고리를 선택하고 퀴즈를 시작하면 호출합니다.
서버는 해당 카테고리의 `published` 상태 퀴즈를 등록 순서대로 배정하여 세션을 생성합니다.

**Request Body**

| 필드     | 타입   | 필수 | 설명                                             |
| -------- | ------ | ---- | ------------------------------------------------ |
| category | string | ✅   | `GET /categories`의 `name` 값 중 하나            |

**Response (201)**

| 필드          | 타입     | 설명                                        |
| ------------- | -------- | ------------------------------------------- |
| sessionId     | number   | 생성된 세션 ID                              |
| category      | string   | 선택한 카테고리                             |
| quizIds       | number[] | 배정된 퀴즈 ID 배열 (등록 순서대로)         |
| totalQuizzes  | number   | 배정된 문제 수 (10)                         |
| createdAt     | string   | 세션 생성 일시                              |

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

> 📌 관리자가 해당 카테고리에 등록한 퀴즈가 등록 순서(createdAt 오름차순)대로 배정됩니다.
> 📌 퀴즈가 0개인 카테고리로 요청 시 `404 Not Found` 반환
> 📌 프론트엔드는 `quizIds` 배열 순서대로 `GET /quizzes/:id`를 호출하여 문제를 표시합니다.

---

### 8-2. 답안 제출 (문제별 즉시 채점)

```
POST /sessions/:sessionId/answers
인증: 필요 (JWT)
```

한 문제를 풀 때마다 호출합니다. 서버가 채점 후 정답과 해설을 즉시 반환합니다.

**Request Body**

| 필드           | 타입           | 필수 | 설명                                                 |
| -------------- | -------------- | ---- | ---------------------------------------------------- |
| quizId         | number         | ✅   | 해당 세션에 배정된 퀴즈 ID                           |
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

| 필드                        | 타입           | 설명                                     |
| --------------------------- | -------------- | ---------------------------------------- |
| sessionId                   | number         | 세션 ID                                  |
| category                    | string         | 카테고리                                 |
| score                       | number         | 맞힌 문제 수                             |
| totalQuizzes                | number         | 전체 문제 수                             |
| completedAt                 | string \| null | 세션 완료 일시 (진행 중이면 `null`)      |
| answers[]                   | array          | 답안 목록 (출제 순서)                    |
| answers[].quizId            | number         | 퀴즈 ID                                  |
| answers[].title             | string         | 퀴즈 제목                                |
| answers[].question          | string         | 문제 내용                                |
| answers[].options           | string[]       | 보기 배열                                |
| answers[].selected_index    | number \| null | 사용자가 선택한 인덱스 (스킵 시 `null`)  |
| answers[].correct           | boolean        | 정답 여부                                |
| answers[].answer            | number         | 정답 인덱스                              |
| answers[].explanation       | string         | 해설                                     |
| answers[].skipped           | boolean        | 스킵 여부                                |

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

사용자의 과거 퀴즈 풀이 기록을 조회합니다. 최신순으로 정렬됩니다.

**Query Parameters**

| 파라미터 | 타입   | 필수 | 설명                                                |
| -------- | ------ | ---- | --------------------------------------------------- |
| category | string | ❌   | `GET /categories`의 `name` 값 중 하나 (없으면 전체) |
| page     | number | ❌   | 페이지 번호 (기본값: 1)                             |
| limit    | number | ❌   | 페이지당 개수 (기본값: 10)                          |

**Response (200)**

| 필드                      | 타입           | 설명                                |
| ------------------------- | -------------- | ----------------------------------- |
| sessions[]                | array          | 세션 목록                           |
| sessions[].sessionId      | number         | 세션 ID                             |
| sessions[].category       | string         | 카테고리                            |
| sessions[].score          | number         | 맞힌 문제 수                        |
| sessions[].totalQuizzes   | number         | 전체 문제 수                        |
| sessions[].completedAt    | string \| null | 완료 일시 (진행 중이면 `null`)      |
| sessions[].createdAt      | string         | 세션 시작 일시                      |
| total                     | number         | 전체 세션 수                        |
| page                      | number         | 현재 페이지                         |

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

## 기존 API 변경 사항

### 6-4. 퀴즈 채점 (`POST /quizzes/:id/submit`) → 폐기

기존 `POST /quizzes/:id/submit`은 세션 없이 단건 채점하는 API였으나, 세션 도입으로 **`POST /sessions/:sessionId/answers`로 대체**됩니다.

| 항목       | 기존 (6-4)                   | 변경 (8-2)                              |
| ---------- | ---------------------------- | --------------------------------------- |
| 엔드포인트 | `POST /quizzes/:id/submit`   | `POST /sessions/:sessionId/answers`     |
| 중복 제출  | 퀴즈 단위 409 (영구 차단)    | 세션 내 퀴즈 단위 409 (새 세션에서 재풀이 가능) |
| 기록 저장  | 없음                         | 세션에 자동 저장                        |
| 재도전     | 불가                         | 새 세션 생성으로 가능                   |

---

## 추가 에러 응답

| 코드  | 상태        | 설명                                       | 발생 예시                                   |
| ----- | ----------- | ------------------------------------------ | ------------------------------------------- |
| `400` | Bad Request | 세션에 배정되지 않은 퀴즈 ID로 답안 제출   | `quizId`가 해당 세션의 `quizIds`에 없는 경우 |
| `404` | Not Found   | 해당 카테고리에 출제 가능한 퀴즈가 없음    | 퀴즈 0개인 카테고리로 세션 생성 시도         |
| `409` | Conflict    | 같은 세션에서 동일 퀴즈에 중복 답안 제출   | 이미 제출한 문제에 다시 답안 전송            |

---

_— END OF DOCUMENT —_
