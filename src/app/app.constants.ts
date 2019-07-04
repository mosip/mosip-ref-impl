export const VERSION = '1.0';
export const IDS = {
  centers: 'mosip.admin.registration.centers'
};
export const BASE_URL = 'https://dev.mosip.io/r2/v1';
export const URL = {
  centers: `${BASE_URL}/masterdata/registrationcenters/search`
};
export const navItems = [
  {
    displayName: 'Home',
    route: '/admin/home',
    children: null
  },
  {
    displayName: 'Resource',
    route: '/admin/resources/'
  },
  {
    displayName: 'Centers',
    route: '/admin/resources/centers'
  },
  {
    displayName: 'Devices',
    route: '/admin/resources/devices'
  },
  {
    displayName: 'Users',
    route: 'resources/users'
  },
  {
    displayName: 'Machines',
    route: '/admin/resources/machines'
  }
];
