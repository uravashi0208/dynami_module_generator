import { MenuItem } from '../models/menu.model';

export class Menu {
  public static pages: MenuItem[] = [
    {
      group: 'Base',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Dashboard',
          route: '/dashboard',
        },
        {
          icon: 'assets/icons/heroicons/outline/cube.svg',
          label: 'User',
          route: '/user',
        },
        {
          icon: 'assets/icons/heroicons/outline/cube.svg',
          label: 'Role',
          route: '/role',
        },
        {
          icon: 'assets/icons/heroicons/outline/cube.svg',
          label: 'Dynamic Module',
          route: '/module',
        },
    {
      icon: 'assets/icons/heroicons/outline/cube.svg',
      label: 'Dfdfsd',
      route: '/dfdfsd',
    },
      ],
    },
  ];
}
