import * as config from 'src/assets/config.json';

export const VERSION = '1.0';
export const BASE_URL = config.baseUrl;
export const IDS = 'dummy';
export const URL = {
  centers: `masterdata/registrationcenters/search`,
  partners: `masterdata/registrationcenters/search`,
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
    children: null,
    auditEventId: 'ADM-002',
    roles: ['ZONAL_ADMIN', 'GLOBAL_ADMIN']
  },
  {
    displayName: 'menuItems.item2.title',
    icon: 'assets/images/support.svg',
    route: 'admin/resources',
    children: [
      {
        displayName: 'menuItems.item2.subItem1',
        icon: null,
        route: '/admin/resources/misp',
        auditEventId: 'ADM-007',
        roles: ['ZONAL_ADMIN', 'GLOBAL_ADMIN']
      },
      {
        displayName: 'menuItems.item2.subItem2',
        icon: null,
        route: '/admin/resources/policy',
        auditEventId: 'ADM-008',
        roles: ['ZONAL_ADMIN', 'GLOBAL_ADMIN']
      },
      {
        displayName: 'menuItems.item2.subItem3',
        icon: null,
        route: '/admin/resources/partner',
        auditEventId: 'ADM-008',
        roles: ['ZONAL_ADMIN', 'GLOBAL_ADMIN']
      },
      {
        displayName: 'menuItems.item2.subItem4',
        icon: null,
        route: '/admin/resources/pmanager',
        auditEventId: 'ADM-008',
        roles: ['ZONAL_ADMIN', 'GLOBAL_ADMIN']
      }
    ],
    auditEventId: 'ADM-003',
    roles: ['ZONAL_ADMIN', 'GLOBAL_ADMIN']
  }
];


export const registrationCreatePartnerId = 'mosip.partnermanagement.partners.create';
export const registrationUpdatePartnerId = 'mosip.partnermanagement.partners.update';

export const MASTERDATA_BASE_URL = `masterdata/`;

export const registrationCenterCreateId = 'string';

export const viewFields = [];

export const masterdataMapping = {
  'blacklisted-words': {
    apiName: 'blacklistedwords',
    specFileName: 'blacklisted-words',
    name: 'Blacklisted Word',
    nameKey: 'word',
    idKey: 'word',
    headerName: 'Blacklisted Words'
  },
  title: {
    apiName: 'title',
    specFileName: 'titles',
    name: 'Title',
    nameKey: 'titleName',
    idKey: 'code',
    headerName: 'Title'
  }
};

export const ListViewIdKeyMapping = {  
  misp:{ idKey:'id', auditEventId:'ADM-081'},
  policy:{ idKey:'id', auditEventId:'ADM-082'},
  partner:{ idKey:'partnerID', auditEventId:'ADM-083'},
  pmanager:{ idKey:'partnerID', auditEventId:'ADM-084'},
  title: { idKey: 'code', auditEventId: 'ADM-069' },
  'blacklisted-words': { idKey: 'word', auditEventId: 'ADM-070' },
  'document-type': { idKey: 'code', auditEventId: 'ADM-071' },
  'document-categories': { idKey: 'code', auditEventId: 'ADM-076' }
};

export const FilterMapping = {
  centers: {
    specFileName: 'center',
    apiName: 'registrationcenters'
  },
  'blacklisted-words': {
    apiName: 'blacklistedwords',
    specFileName: 'blacklisted-words'
  },
  'document-type': {
    apiName: 'documenttypes',
    specFileName: 'document-types'
  },
  'gender-type': {
    apiName: 'gendertypes',
    specFileName: 'gender-types'
  },
  title: {
    apiName: 'title',
    specFileName: 'titles'
  },
  'document-categories': {
    apiName: 'documentcategories',
    specFileName: 'document-category'
  }
};

export const keyboardMapping = {
  eng: 'en',
  fra: 'fr',
  ara: 'ar'
};
