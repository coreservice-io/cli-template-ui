export default [
  {
    path: "/",
    name: "home",
    component: () => import("../../pages/main/welcome/WelcomePage.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "page not found",
    component: () => import("../../pages/main/notfound/NotfoundPage.vue"),
  },
];
