import {Component, ViewEncapsulation} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { BulkuploadService } from 'src/app/core/services/bulkupload.service';

@Component({
  templateUrl: './singleview.component.html',
  styleUrls: ['./singleview.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SingleviewComponent {

  uploadForm: FormGroup;
  dropDownValues = ['Insert', 'Update', 'Delete'];
  // tslint:disable-next-line:max-line-length
  tableNames = [{ id: 'applicant_valid_document', value: 'ApplicantValidDocument'}, { id: 'appl_form_type', value: 'Application'}, { id: 'biometric_attribute', value: 'BiometricAttribute'}, { id: 'biometric_type', value: 'BiometricType'}, { id: 'blacklisted_words', value: 'BlacklistedWords'}, { id: 'daysofweek_list', value: 'DaysOfWeek'}, { id: 'device_master', value: 'Device'}, { id: 'registered_device_master', value: 'DeviceRegister'}, { id: 'device_spec', value: 'DeviceSpecification'}, { id: 'device_type', value: 'DeviceType'}, { id: 'doc_category', value: 'DocumentCategory'}, { id: 'doc_type', value: 'DocumentType'}, { id: 'dynamic_field', value: 'DynamicField'}, { id: 'reg_exceptional_holiday', value: 'ExceptionalHoliday'}, { id: 'foundational_trust_provider', value: 'FoundationalTrustProvider'},  { id: 'gender', value: 'Gender'}, { id: 'loc_holiday', value: 'Holiday'}, { id: 'identity_schema', value: 'IdentitySchema'}, { id: 'id_type', value: 'IdType'}, { id: 'individual_type', value: 'IndividualType'}, { id: 'language', value: 'Language'}, { id: 'location', value: 'Location'}, { id: 'loc_hierarchy_list', value: 'LocationHierarchy'}, { id: 'machine_master', value: 'Machine'}, { id: 'machine_spec', value: 'MachineSpecification'}, { id: 'machine_type', value: 'MachineType'}, { id: 'module_detail', value: 'ModuleDetail'}, { id: 'mosip_device_service', value: 'MOSIPDeviceService'}, { id: 'reason_category', value: 'ReasonCategory'}, { id: 'reason_list', value: 'ReasonList'}, { id: 'reg_exceptional_holiday', value: 'RegExceptionalHoliday'}, { id: 'registered_device_master', value: 'RegisteredDevice'}, { id: 'registration_center', value: 'RegistrationCenter'}, { id: 'reg_center_device', value: 'RegistrationCenterDevice'}, { id: 'reg_center_machine', value: 'RegistrationCenterMachine'}, { id: 'reg_center_machine_device', value: 'RegistrationCenterMachineDevice'}, { id: 'reg_center_type', value: 'RegistrationCenterType'}, { id: 'reg_center_user', value: 'RegistrationCenterUser'}, { id: 'reg_center_user_machine', value: 'RegistrationCenterUserMachine'}, { id: 'reg_device_sub_type', value: 'RegistrationDeviceSubType'}, { id: 'reg_device_type', value: 'RegistrationDeviceType'}, { id: 'reg_working_nonworking', value: 'RegWorkingNonWorking'}, { id: 'schema_def', value: 'SchemaDefinition'}, { id: 'template', value: 'Template'}, { id: 'template_file_format', value: 'TemplateFileFormat'}, { id: 'template_type', value: 'TemplateType'}, { id: 'title', value: 'Title'}, { id: 'user_detail', value: 'UserDetails'}, { id: 'valid_document', value: 'ValidDocument'}, { id: 'zone', value: 'Zone'}, { id: 'zone_user', value: 'ZoneUser'}];
  subscribed: any;
  data: any;
  constructor(
  private bulkuploadService: BulkuploadService,
  private location: Location,
  private router: Router,
  public activatedRoute: ActivatedRoute,
  ) {
    this.subscribed = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.initializeComponent();
      }
    });
  }

  initializeComponent() {
    this.activatedRoute.params.subscribe(params => {
      this.getData(params);
    });
  }

  getData(params) {
    this.bulkuploadService
    .getTransactionDetails(params.id)
    .subscribe(({ response, errors }) => {
      console.log(response);
      if (response != null) {
        this.data = response;
      }
    });
  }

  cancel() {
    this.location.back();
  }
}
