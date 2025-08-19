export interface MenuItem {
  id: number;
  label: string;
  path: string;
  icon?: string;
}

export const menuItems: MenuItem[] = [
  {
    id: 1,
    label: "Home",
    path: "/",
  },
  {
    id: 2,
    label: "Categories",
    path: "/categories",
  },
  {
    id: 3,
    label: "Contact",
    path: "/contact",
  },
  {
    id: 4,
    label: "Orders",
    path: "/orders",
  },
  {
    id: 5,
    label: "Suggestions",
    path: "/suggestions",
  },
];
