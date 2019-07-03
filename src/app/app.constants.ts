export const navItems = [
    {
      displayName: 'menuItems.item1.title',
      route: '/admin/home',
      children: null
    },
    {
      displayName: 'menuItems.item2.title',
      route: 'admin/resources',
      children: [
        {
          displayName: 'menuItems.item2.subItem1',
          route: '/admin/resources/centers',
        },
        {
          displayName: 'menuItems.item2.subItem2',
          route: '/admin/resources/devices',
        },
        {
          displayName: 'menuItems.item2.subItem3',
          route: 'resources/users',
        },
        {
          displayName: 'menuItems.item2.subItem4',
          route: '/admin/resources/machines',
        },
      ]
    }
  ];

export const MASTERDATA_BASE_URL = 'https://dev.mosip.io/r2/v1/masterdata/';
export const processingTimeStart = 15;
export const processingTimeEnd = 45;
export const processingTimeInterval = 5;
export const timeSlotsInterval = 30;
