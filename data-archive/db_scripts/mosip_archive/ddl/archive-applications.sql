-- -------------------------------------------------------------------------------------------------
-- Database Name: mosip_archive
-- Table Name 	: archive.applications
-- Purpose    	: Applications: 
--           
-- Create By   	: Ram Bhatt
-- Created Date	: Oct-2021
--
-- Modified Date        Modified By         Comments / Remarks
-- ------------------------------------------------------------------------------------------
-- 
-- ------------------------------------------------------------------------------------------
-- object: archive.applications | type: TABLE --
-- DROP TABLE IF EXISTS archive.applications CASCADE;
CREATE TABLE archive.applications(
	application_id character varying(36) NOT NULL,
	booking_type character varying(256) NOT NULL,
	booking_status_code character varying(256),
	application_status_code character varying(256),
	regcntr_id character varying(10),
	appointment_date date,
	booking_date date,
	slot_from_time time without time zone,
	slot_to_time time without time zone,
	contact_info character varying(256),
	cr_by character varying(256) NOT NULL,
	cr_dtimes timestamp without time zone NOT NULL,
	upd_by character varying(256),
	upd_dtimes timestamp without time zone,
	CONSTRAINT appid_pk PRIMARY KEY (application_id)

);
-- ddl-end --
