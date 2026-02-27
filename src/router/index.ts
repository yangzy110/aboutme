import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/page/1",
      name: "page-1",
      component: () => import("../views/Page1View.vue"),
    },
    {
      path: "/page/2",
      name: "page-2",
      component: () => import("../views/Page2View.vue"),
    },
    {
      path: "/page/3",
      name: "page-3",
      component: () => import("../views/Page3View.vue"),
    },
    {
      path: "/page/4",
      name: "page-4",
      component: () => import("../views/Page4View.vue"),
    },
  ],
});

export default router;
