export const VERSION = '1.0';
export const IDS = {
  centers: 'mosip.admin.registration.centers'
};
export const BASE_URL = 'https://dev.mosip.io/r2/v1';
export const URL = {
  centers: `${BASE_URL}/masterdata/registrationcenters/search`,
  devices: `${BASE_URL}/masterdata/devices/search`,
  machines: `${BASE_URL}/masterdata/machines/search`

};
export const navItems = [
  {
    displayName: 'menuItems.item1.title',
    icon: '../assets/images/home.svg',
    route: '/admin/home',
    children: null
  },
  {
    displayName: 'menuItems.item2.title',
    icon: 'assets/images/support.svg',
    route: 'admin/resources',
    children: [
      {
        displayName: 'menuItems.item2.subItem1',
        icon: null,
        route: '/admin/resources/centers',
      },
      {
        displayName: 'menuItems.item2.subItem2',
        icon: null,
        route: '/admin/resources/devices',
      },
      {
        displayName: 'menuItems.item2.subItem3',
        icon: null,
        route: 'resources/users',
      },
      {
        displayName: 'menuItems.item2.subItem4',
        icon: null,
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

export const registrationCenterCreateId = 'string';

export const viewFields = [];
