import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "MapLocation",
    component: () => import("./components/MapLocation.vue"),
  },
  {
    path: "/download",
    name: "Download",
    component: () => import("./components/Download.vue"),
  },
  {
    path: "/notification",
    name: "Notification",
    component: () => import("./components/Notification.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
