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
        categories: resolve(__dirname, "pages/category.html"),
        quiz: resolve(__dirname, "pages/quiz.html"),
        result: resolve(__dirname, "pages/result.html"),
        history: resolve(__dirname, "pages/history.html"),
        // adminLogin: resolve(__dirname, "pages/admin/login.html"),
        adminQuestions: resolve(__dirname, "pages/admin/quiz-list.html"),
        adminQuestionNew: resolve(__dirname, "pages/admin/quiz-form.html"),
        adminQuestionDetail: resolve(__dirname, "pages/admin/quiz-detail.html"),
        adminQuestionEdit: resolve(__dirname, "pages/admin/quiz-edit.html"),
      },
    },
  },
});
