export default [
  {
    path: "/admin/user_mgr",
    component: () => import("../../pages/main/user_mgr/user_mgr.vue"),
  },
  {
    path: "/admin/kv_mgr",
    component: () => import("../../pages/main/kv_mgr/kv_mgr.vue"),
  },
];
