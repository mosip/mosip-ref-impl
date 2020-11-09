\c mosip_pms sysadmin

\set CSVDataPath '\'/home/dbadmin/mosip_pms/'

-------------- Level 1 data load scripts ------------------------

----- TRUNCATE pms.key_policy_def TABLE Data and It's reference Data and COPY Data from CSV file -----
TRUNCATE TABLE pms.partner_type cascade ;

\COPY pms.partner_type (code,partner_description,is_active,cr_by,cr_dtimes,is_policy_required) FROM './dml/pms-partner_type.csv' delimiter ',' HEADER  csv;

----- TRUNCATE pms.partner TABLE Data and It's reference Data and COPY Data from CSV file -----
TRUNCATE TABLE pms.partner cascade ;

\COPY pms.app_detail (id,policy_group_id,name,address,contact_no,email_id,certificate_alias,user_id,partner_type_code,approval_status,is_active,cr_by,cr_dtimes) FROM './dml/pms-app_detail.csv' delimiter ',' HEADER  csv;

----- TRUNCATE pms.policy_group TABLE Data and It's reference Data and COPY Data from CSV file -----
TRUNCATE TABLE pms.policy_group cascade ;

\COPY pms.policy_group (id,name,descr,user_id,is_active,cr_by,cr_dtimes) FROM './dml/pms-policy_group.csv' delimiter ',' HEADER  csv;

----- TRUNCATE pms.partner_h TABLE Data and It's reference Data and COPY Data from CSV file -----
TRUNCATE TABLE pms.partner_h cascade ;

\COPY pms.partner_h (id,policy_group_id,name,address,contact_no,email_id,certificate_alias,user_id,partner_type_code,approval_status,is_active,cr_by,cr_dtimes,eff_dtimes) FROM './dml/pms-partner_h.csv' delimiter ',' HEADER  csv;

---------------------------------------------------------------------------------------------------------------------------------------------------------------------


















