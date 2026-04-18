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
        category: resolve(__dirname, "pages/category.html"),
        quiz: resolve(__dirname, "pages/quiz.html"),
        result: resolve(__dirname, "pages/result.html"),
        history: resolve(__dirname, "pages/history.html"),
        adminQuizList: resolve(__dirname, "pages/admin/quiz-list.html"),
        adminQuizForm: resolve(__dirname, "pages/admin/quiz-form.html"),
        adminQuizDetail: resolve(__dirname, "pages/admin/quiz-detail.html"),
        adminQuizEdit: resolve(__dirname, "pages/admin/quiz-edit.html"),
      },
    },
  },
});
