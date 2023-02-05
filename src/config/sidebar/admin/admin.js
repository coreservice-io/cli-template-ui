import { UsersIcon,TagIcon, ListBulletIcon, CodeBracketIcon, ArrowsPointingOutIcon, ViewColumnsIcon, TableCellsIcon, ChartBarIcon, FlagIcon, AdjustmentsHorizontalIcon, ChevronDoubleRightIcon, PlayIcon, WindowIcon, ChatBubbleLeftIcon, PhotoIcon, InformationCircleIcon, StopIcon, ViewfinderCircleIcon, CommandLineIcon, FolderIcon, ClipboardDocumentListIcon } from "@heroicons/vue/24/outline";

let admin = [
  {
    name: "admin",
    icon: FolderIcon,
    open: true,
    children: [
      {
        name: "User Manager",
        icon: UsersIcon,
        open: false,
        href: "/admin/user_mgr",
        auth: function (user) {
          return user.roles.includes("admin");
        },
      },
      {
        name: "DBKV",
        icon: ListBulletIcon,
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
