import * as config from 'src/assets/config.json';

export const VERSION = '1.0';
export const BASE_URL = config.baseUrl;
export const IDS = 'dummy';
export const URL = {
  centers: `masterdata/registrationcenters/search`,
  devices: `masterdata/devices/search`,
  machines: `masterdata/machines/search`,
  documentCategories: `masterdata/documentcategories`,
  mappedDocUrl: `masterdata/documenttypes/`,
  unMappedDocUrl: `masterdata/documenttypes/`
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

export const MASTERDATA_BASE_URL = `masterdata/`;
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
  holiday: {
    apiName: 'holidays',
    specFileName: 'holiday-data',
    name: 'Holiday',
    nameKey: 'holidayName',
    idKey: 'holidayId',
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
  'device-types': {
    apiName: 'devicetypes',
    specFileName: 'device-type',
    name: 'Device Type',
    nameKey: 'name',
    idKey: 'code',
    headerName: 'Device Type'
  },
  'document-categories': {
    apiName: 'documentcategories',
    specFileName: 'document-category',
    name: 'Document Category',
    nameKey: 'name',
    idKey: 'code',
    headerName: 'Document Category'
  },
  'machine-specs': {
    apiName: 'machinespecifications',
    specFileName: 'machine-specification',
    name: 'Machine Specification',
    nameKey: 'name',
    idKey: 'id',
    headerName: 'Machine Specification'
  },
  'device-specs': {
    apiName: 'devicespecifications',
    specFileName: 'device-specification',
    name: 'Device Specification',
    nameKey: 'name',
    idKey: 'id',
    headerName: 'Device Specification'
  },
  'center-type': {
    apiName: 'registrationcentertypes',
    specFileName: 'center-type',
    name: 'Registration Center Type',
    nameKey: 'name',
    idKey: 'id',
    headerName: 'Registration Center Type'
  },
  'individual-type': {
    apiName: 'individualtypes',
    specFileName: 'individual-types',
    name: 'Individual Type',
    nameKey: 'name',
    idKey: 'id',
    headerName: 'Individual Type'
  }

};

export const ListViewIdKeyMapping = {

  centers: { idKey: 'id', imagePath: 'assets/images/center-name-icon.png'},
  devices: { idKey: 'id' },
  machines: { idKey: 'id' },
  'machine-type': {idKey: 'code'},
  templates: {idKey: 'id'},
  title: {idKey: 'code'},
  'blacklisted-words': {idKey: 'word'},
  'document-type': {idKey: 'code'},
   location: {idKey: 'code'},
   'device-specs': {idKey: 'id'},
   'machine-specs': {idKey: 'id'},
   'device-types': {idKey: 'code'},
   'document-categories': {idKey: 'code'},
   'individual-type': {idKey: 'code'},
   'gender-type': {idKey: 'code'},
   'center-type': {idKey: 'code'},
   holiday: {idKey: 'holidayId'}
};

export const FilterMapping = {
centers: {
specFileName: 'center',
apiName: 'registrationcenters'
},
devices: {
specFileName: 'devices',
apiName: 'devices'
},
machines: {
  specFileName: 'machines',
  apiName: 'machines'
  },
'blacklisted-words': {
  apiName: 'blacklistedwords',
  specFileName: 'blacklisted-words'
},
holiday: {
  apiName: 'holidays',
  specFileName: 'holiday-data'
},
'document-type': {
  apiName: 'documenttypes',
  specFileName: 'document-types'
},
location: {
  apiName: 'locations',
  specFileName: 'location-data'
},
'gender-type': {
  apiName: 'gendertypes',
  specFileName: 'gender-types'
},
title: {
  apiName: 'title',
  specFileName: 'titles'
},
templates: {
  apiName: 'templates',
  specFileName: 'templates'
},
'machine-type': {
  apiName: 'machinetypes',
  specFileName: 'machine-type'
},
'device-types': {
  apiName: 'devicetypes',
  specFileName: 'device-type'
},
'document-categories': {
  apiName: 'documentcategories',
  specFileName: 'document-category'
},
'machine-specs': {
  apiName: 'machinespecifications',
  specFileName: 'machine-specification'
},
'device-specs': {
  apiName: 'devicespecifications',
  specFileName: 'device-specification'
},
'center-type': {
  apiName: 'registrationcentertypes',
  specFileName: 'center-type'
},
'individual-type': {
  apiName: 'individualtypes',
  specFileName: 'individual-types'
}
};

export const keyboardMapping = {
  eng: 'en',
  fra: 'fr',
  ara: 'ar'
};
