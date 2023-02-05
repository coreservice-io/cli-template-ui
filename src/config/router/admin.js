export default [
  {
    path: "/admin/user_mgr",
    component: () => import("../../pages/user_mgr/user_mgr.vue"),
  },
  {
    path: "/admin/kv_mgr",
    component: () => import("../../pages/kv_mgr/kv_mgr.vue"),
  },
];
