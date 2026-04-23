import "./style.css";

import { initIndexPage } from "./pages/index.js";
import { initLoginPage } from "./pages/login.js";
import { initSignupPage } from "./pages/signup.js";
import { initCategoryPage } from "./pages/category.js";
import { initQuizPage } from "./pages/quiz.js";
import { initResultPage } from "./pages/result.js";
import { initHistoryPage } from "./pages/history.js";
import { initQuizListPage } from "./pages/admin/quiz-list.js";
import { initQuizFormPage } from "./pages/admin/quiz-form.js";
import { initQuizDetailPage } from "./pages/admin/quiz-detail.js";
import { initQuizEditPage } from "./pages/admin/quiz-edit.js";

const path = window.location.pathname;

if (path.endsWith("/index.html") || path === "/") {
  initIndexPage();
} else if (path.endsWith("/pages/login.html")) {
  initLoginPage();
} else if (path.endsWith("/pages/signup.html")) {
  initSignupPage();
} else if (path.endsWith("/pages/category.html")) {
  initCategoryPage();
} else if (path.endsWith("/pages/quiz.html")) {
  initQuizPage();
} else if (path.endsWith("/pages/result.html")) {
  initResultPage();
} else if (path.endsWith("/pages/history.html")) {
  initHistoryPage();
} else if (path.endsWith("/pages/admin/quiz-list.html")) {
  initQuizListPage();
} else if (path.endsWith("/pages/admin/quiz-form.html")) {
  initQuizFormPage();
} else if (path.endsWith("/pages/admin/quiz-detail.html")) {
  initQuizDetailPage();
} else if (path.endsWith("/pages/admin/quiz-edit.html")) {
  initQuizEditPage();
}