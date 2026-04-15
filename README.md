# NAILED IT (👍🏻 ˃ ᴗ ˂ )👍🏻

> Nail your frontend skills with quizzes.

## 📌 Overview

- **서비스 성격**: 프론트엔드 개념 학습 플랫폼 🧩
- **주요 타겟**: 프론트엔드 기초를 다지고 싶은 학습자 🐣
- **핵심 가치**: 문제 풀이를 통한 직관적인 학습 경험 제공 💡

## ⭐ Goals

- 프론트엔드 핵심 개념의 퀴즈화 🔎
- 사용자 친화적인 UI/UX 구현 🎨
- 지속적인 문제 업데이트 및 기능 확장 📈

## ✨ Features

- 🧑‍💻 관리자(Admin)
  - 퀴즈 등록 / 수정 / 삭제
  - 카테고리 관리

- 🙋‍♀️ 사용자(User)
  - 카테고리별 퀴즈 풀이
  - 정답 및 해설 확인

- 🔐 로그인 상태에 따른 기능 제한

## 🛠 Tech Stack

- **Frontend**: Vanilla JavaScript (Vite) ⚡️
- **Styling**: Tailwind CSS 🌊
- **API**: REST API 🔥
- **Architecture**: Role-based (Admin · User) 👥

## 📁 Project Structure

```plaintext
NAILED-IT/
├── index.html                # 서비스 소개 및 시작 화면
├── src/
│   ├── pages/
│   │   ├── login.html        # 로그인
│   │   ├── signup.html       # 회원가입
│   │   ├── category.html     # 카테고리 선택
│   │   ├── quiz.html         # 퀴즈 풀이
│   │   ├── result.html       # 퀴즈 결과
│   │   ├── history.html      # 히스토리
│   │   └── admin/
│   │       ├── quiz-list.html
│   │       ├── quiz-form.html
│   │       ├── quiz-edit.html
│   │       └── quiz-detail.html
│   │
│   ├── js/
│   │   ├── api/              # API 호출 (fetch 전담)
│   │   │   └── api.js
│   │   ├── pages/            # 페이지별 로직
│   │   │   ├── login.js
│   │   │   ├── signup.js
│   │   │   ├── category.js
│   │   │   ├── quiz.js
│   │   │   ├── result.js
│   │   │   ├── history.js
│   │   │   └── admin/
│   │   │       ├── quiz-list.js
│   │   │       ├── quiz-form.js
│   │   │       ├── quiz-edit.js
│   │   │       └── quiz-detail.js
│   │   └── utils/
│   │
│   ├── main.js               # Vite 진입점
│   └── style.css             # Tailwind CSS
│
├── package.json
└── vite.config.js
```

> 📍 개발 진행에 따라 구조가 추가되거나 변경될 수 있습니다!!

## 💻 Getting Started

프로젝트를 로컬 환경에서 실행하려면 아래 단계를 따라주세요.

```bash
# 1. 저장소 클론
git clone https://github.com/FRONTENDBOOTCAMP-17th/nailed-it.git

# 2. 폴더 이동
cd nailed-it

# 3. 의존성 설치
npm install

# 4. 프로젝트 실행
npm run dev
```

## 🔗 Deployment

Live Demo: Coming Soon 🚀

---

Designed and Developed with 🖤 by [**Kim Yeon-soo**](https://github.com/harikim02)
