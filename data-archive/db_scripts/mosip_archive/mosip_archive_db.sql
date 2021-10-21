DROP DATABASE IF EXISTS mosip_archive;
CREATE DATABASE mosip_archive
	ENCODING = 'UTF8'
	LC_COLLATE = 'en_US.UTF-8'
	LC_CTYPE = 'en_US.UTF-8'
	TABLESPACE = pg_default
	OWNER = sysadmin
	TEMPLATE  = template0;
-- ddl-end --
COMMENT ON DATABASE mosip_archive IS 'Database to store all archive data, Data is archived from multiple tables from each module.';
-- ddl-end --

\c mosip_archive sysadmin

-- object: archive | type: SCHEMA --
DROP SCHEMA IF EXISTS archive CASCADE;
CREATE SCHEMA archive;
-- ddl-end --
ALTER SCHEMA archive OWNER TO sysadmin;
-- ddl-end --

ALTER DATABASE mosip_archive SET search_path TO archive,pg_catalog,public;
-- ddl-end --

-- REVOKECONNECT ON DATABASE mosip_archive FROM PUBLIC;
-- REVOKEALL ON SCHEMA archive FROM PUBLIC;
-- REVOKEALL ON ALL TABLES IN SCHEMA archive FROM PUBLIC ;
