import * as config from 'src/assets/config.json';

export const VERSION = '1.0';
export const BASE_URL = config.baseUrl;
export const URL = {
  centers:  `${config.baseUrl}masterdata/registrationcenters/search`,
  devices:  `${config.baseUrl}masterdata/devices/search`,
  machines: `${config.baseUrl}masterdata/machines/search`
};
export const navItems = [
  {
    displayName: 'menuItems.item1.title',
    icon: './assets/images/home.svg',
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
        route: 'resources/users'
      },
      {
        displayName: 'menuItems.item2.subItem4',
        icon: null,
        route: '/admin/resources/machines'
      }
    ]
  },
  {
    displayName: 'menuItems.item3.title',
    icon: './assets/images/id-card.svg',
    route: '/admin/masterdata',
    children: null
  }
];

export const MASTERDATA_BASE_URL = `${config.baseUrl}masterdata/`;
export const processingTimeStart = 15;
export const processingTimeEnd = 45;
export const processingTimeInterval = 5;
export const timeSlotsInterval = 30;

export const registrationCenterCreateId = 'string';

export const viewFields = [];

export const masterdataMapping = {
  'blacklisted-words': {
    apiName: 'blacklistedwords',
    specFileName: 'blacklisted-words',
    name: 'Black Listed Word',
    nameKey: '',
    idKey: '',
    headerName: 'Blacklisted Words'
  },
  holidays: {
    apiName: 'holidays',
    specFileName: 'holiday-data',
    name: 'Holiday',
    nameKey: 'holidayName',
    idKey: '',
    headerName: 'Holidays'
  },
  'document-type': {
    apiName: 'documenttypes',
    specFileName: 'document-types',
    name: 'Document Types',
    nameKey: 'name',
    idKey: 'code',
    headerName: 'Document Type'
  },
  location: {
    apiName: 'locations',
    specFileName: 'location-data',
    name: 'Location',
    nameKey: 'name',
    idKey: 'code',
    headerName: 'Location'
  },
  'gender-type': {
    apiName: 'gendertypes',
    specFileName: 'gender-types',
    name: 'Gender Type',
    nameKey: 'name',
    idKey: 'code',
    headerName: 'Gender Type'
  },
  title: {
    apiName: 'title',
    specFileName: 'titles',
    name: 'Title',
    nameKey: 'name',
    idKey: 'code',
    headerName: 'Title'
  },
  templates: {
    apiName: 'templates',
    specFileName: 'templates',
    name: 'Templates',
    nameKey: 'name',
    idKey: 'id',
    headerName: 'Templates'
  },
  'machine-type': {
    apiName: 'machinetypes',
    specFileName: 'machine-type',
    name: 'Machine Type',
    nameKey: 'name',
    idKey: 'code',
    headerName: 'Machine Type'
  },
  'device-type': {
    apiName: 'devicetypes',
    specFileName: 'device-type',
    name: 'Device Type',
    nameKey: 'name',
    idKey: 'code',
    headerName: 'Device Type'
  },
  'document-category': {
    apiName: 'documentcategories',
    specFileName: 'document-category',
    name: 'Document Category',
    nameKey: 'name',
    idKey: 'code',
    headerName: 'Document Category'
  },
  'machine-specification': {
    apiName: 'machinespecifications',
    specFileName: 'machine-specification',
    name: 'Machine Specification',
    nameKey: 'name',
    idKey: 'id',
    headerName: 'Machine Specification'
  },
  'device-specification': {
    apiName: 'devicespecifications',
    specFileName: 'device-specification',
    name: 'Device Specification',
    nameKey: 'name',
    idKey: 'id',
    headerName: 'Device Specification'
  },

};

export const ListViewIdKeyMapping = {

  centers: { idKey: 'id' },
  devices: { idKey: 'id' },
  machines: { idKey: 'id' },
  'machine-type': {idKey: 'code'},
  templates: {idKey: 'id'},
  title: {idKey: 'code'},
  'blacklisted-words': {idKey: 'word'},
  'document-type': {idKey: 'code'},
   location: {idKey: 'code'},
   'device-specification': {idKey: 'id'},
   'machine-specification': {idKey: 'id'},
   'device-type': {idKey: 'code'},
   'document-category': {idKey: 'code'},






};
