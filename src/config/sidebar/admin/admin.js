import { UsersIcon, FolderIcon,CircleStackIcon } from "@heroicons/vue/24/outline";

let admin = [
  {
    name: "admin",
    icon: FolderIcon,
    open: true,
    auth: function (user) {
      return user.roles.includes("admin");
    },
    children: [
      {
        name: "user_mgr",
        icon: UsersIcon,
        open: false,
        href: "/admin/user_mgr",
        auth: function (user) {
          return user.roles.includes("admin");
        },
      },
      {
        name: "dbkv",
        icon: CircleStackIcon,
        open: false,
        href: "/admin/kv_mgr",
        auth: function (user) {
          return user.roles.includes("admin");
        },
      },
    ],
  },
];

export default admin;
