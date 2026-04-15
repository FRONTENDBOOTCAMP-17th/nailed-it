import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "pages/login.html"),
        signup: resolve(__dirname, "pages/signup.html"),
        categories: resolve(__dirname, "pages/categories.html"),
        quiz: resolve(__dirname, "pages/quiz.html"),
        result: resolve(__dirname, "pages/result.html"),
        history: resolve(__dirname, "pages/history.html"),
        adminLogin: resolve(__dirname, "pages/admin/login.html"),
        adminQuestions: resolve(__dirname, "pages/admin/question-list.html"),
        adminQuestionNew: resolve(__dirname, "pages/admin/question-new.html"),
        adminQuestionDetail: resolve(__dirname, "pages/admin/question-detail.html"),
        adminQuestionEdit: resolve(__dirname, "pages/admin/question-edit.html"),
      },
    },
  },
});
