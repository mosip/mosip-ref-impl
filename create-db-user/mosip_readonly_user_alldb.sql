\c mosip_audit sysadmin

-- object: dbuser | type: ROLE --
-- DROP ROLE IF EXISTS dbuser;
CREATE ROLE :rodbuser WITH 
	INHERIT
	LOGIN
	PASSWORD :rodbuserpwd;
-- ddl-end --
--------------------------------------------------------------------------------------
-- object: grant_18180691b7 | type: PERMISSION --
GRANT CONNECT
   ON DATABASE mosip_audit
   TO :rodbuser;
-- ddl-end --

-- object: grant_3543fb6cf7 | type: PERMISSION --
GRANT USAGE
   ON SCHEMA audit
   TO :rodbuser;
-- ddl-end --

-- object: grant_8e1a2559ed | type: PERMISSION --
GRANT SELECT
   ON ALL TABLES IN SCHEMA audit
   TO :rodbuser;
-- ddl-end --

ALTER DEFAULT PRIVILEGES IN SCHEMA audit 
	GRANT SELECT ON TABLES TO :rodbuser;

------------------------------------------------------------------------------------------	
\c mosip_iam sysadmin
	
-- object: grant_18180691b7 | type: PERMISSION --
GRANT CONNECT
   ON DATABASE mosip_iam
   TO :rodbuser;
-- ddl-end --

-- object: grant_3543fb6cf7 | type: PERMISSION --
GRANT USAGE
   ON SCHEMA iam
   TO :rodbuser;
-- ddl-end --

-- object: grant_8e1a2559ed | type: PERMISSION --
GRANT SELECT
   ON ALL TABLES IN SCHEMA iam
   TO :rodbuser;
-- ddl-end --

ALTER DEFAULT PRIVILEGES IN SCHEMA iam
	GRANT SELECT ON TABLES TO :rodbuser;
-----------------------------------------------------------------------------------------
	
\c mosip_ida sysadmin

-- object: grant_18180691b7 | type: PERMISSION --
GRANT CONNECT
   ON DATABASE mosip_ida
   TO :rodbuser;
-- ddl-end --

-- object: grant_3543fb6cf7 | type: PERMISSION --
GRANT USAGE
   ON SCHEMA ida
   TO :rodbuser;
-- ddl-end --

-- object: grant_8e1a2559ed | type: PERMISSION --
GRANT SELECT
   ON ALL TABLES IN SCHEMA ida
   TO :rodbuser;
-- ddl-end --

ALTER DEFAULT PRIVILEGES IN SCHEMA ida
	GRANT SELECT ON TABLES TO :rodbuser;
-------------------------------------------------------------------------------------------	
	
\c mosip_idmap sysadmin

-- object: grant_18180691b7 | type: PERMISSION --
GRANT CONNECT
   ON DATABASE mosip_idmap
   TO :rodbuser;
-- ddl-end --

-- object: grant_3543fb6cf7 | type: PERMISSION --
GRANT USAGE
   ON SCHEMA idmap
   TO :rodbuser;
-- ddl-end --

-- object: grant_8e1a2559ed | type: PERMISSION --
GRANT SELECT
   ON ALL TABLES IN SCHEMA idmap
   TO :rodbuser;
-- ddl-end --

ALTER DEFAULT PRIVILEGES IN SCHEMA idmap
	GRANT SELECT ON TABLES TO :rodbuser;
-------------------------------------------------------------------------------------------	
	
\c mosip_idrepo sysadmin

-- object: grant_18180691b7 | type: PERMISSION --
GRANT CONNECT
   ON DATABASE mosip_idrepo
   TO :rodbuser;
-- ddl-end --

-- object: grant_3543fb6cf7 | type: PERMISSION --
GRANT USAGE
   ON SCHEMA idrepo
   TO :rodbuser;
-- ddl-end --

-- object: grant_8e1a2559ed | type: PERMISSION --
GRANT SELECT
   ON ALL TABLES IN SCHEMA idrepo
   TO :rodbuser;
-- ddl-end --

ALTER DEFAULT PRIVILEGES IN SCHEMA idrepo
	GRANT SELECT ON TABLES TO :rodbuser;
-------------------------------------------------------------------------------------------	
	
\c mosip_kernel sysadmin

-- object: grant_18180691b7 | type: PERMISSION --
GRANT CONNECT
   ON DATABASE mosip_kernel
   TO :rodbuser;
-- ddl-end --

-- object: grant_3543fb6cf7 | type: PERMISSION --
GRANT USAGE
   ON SCHEMA kernel
   TO :rodbuser;
-- ddl-end --

-- object: grant_8e1a2559ed | type: PERMISSION --
GRANT SELECT
   ON ALL TABLES IN SCHEMA kernel
   TO :rodbuser;
-- ddl-end --

ALTER DEFAULT PRIVILEGES IN SCHEMA kernel
	GRANT SELECT ON TABLES TO :rodbuser;
-------------------------------------------------------------------------------------------	

\c mosip_master sysadmin

-- object: grant_18180691b7 | type: PERMISSION --
GRANT CONNECT
   ON DATABASE mosip_master
   TO :rodbuser;
-- ddl-end --

-- object: grant_3543fb6cf7 | type: PERMISSION --
GRANT USAGE
   ON SCHEMA master
   TO :rodbuser;
-- ddl-end --

-- object: grant_8e1a2559ed | type: PERMISSION --
GRANT SELECT
   ON ALL TABLES IN SCHEMA master
   TO :rodbuser;
-- ddl-end --

ALTER DEFAULT PRIVILEGES IN SCHEMA master
	GRANT SELECT ON TABLES TO :rodbuser;
-------------------------------------------------------------------------------------------
	
\c mosip_prereg sysadmin

-- object: grant_18180691b7 | type: PERMISSION --
GRANT CONNECT
   ON DATABASE mosip_prereg
   TO :rodbuser;
-- ddl-end --

-- object: grant_3543fb6cf7 | type: PERMISSION --
GRANT USAGE
   ON SCHEMA prereg
   TO :rodbuser;
-- ddl-end --

-- object: grant_8e1a2559ed | type: PERMISSION --
GRANT SELECT
   ON ALL TABLES IN SCHEMA prereg
   TO :rodbuser;
-- ddl-end --

ALTER DEFAULT PRIVILEGES IN SCHEMA prereg
	GRANT SELECT ON TABLES TO :rodbuser;
-------------------------------------------------------------------------------------------	
	
\c mosip_regprc sysadmin

-- object: grant_18180691b7 | type: PERMISSION --
GRANT CONNECT
   ON DATABASE mosip_regprc
   TO :rodbuser;
-- ddl-end --

-- object: grant_3543fb6cf7 | type: PERMISSION --
GRANT USAGE
   ON SCHEMA regprc
   TO :rodbuser;
-- ddl-end --

-- object: grant_8e1a2559ed | type: PERMISSION --
GRANT SELECT
   ON ALL TABLES IN SCHEMA regprc
   TO :rodbuser;
-- ddl-end --

ALTER DEFAULT PRIVILEGES IN SCHEMA regprc
	GRANT SELECT ON TABLES TO :rodbuser;
-------------------------------------------------------------------------------------------	
	
\c mosip_pms sysadmin

-- object: grant_18180691b7 | type: PERMISSION --
GRANT CONNECT
   ON DATABASE mosip_pms
   TO :rodbuser;
-- ddl-end --

-- object: grant_3543fb6cf7 | type: PERMISSION --
GRANT USAGE
   ON SCHEMA pms
   TO :rodbuser;
-- ddl-end --

-- object: grant_8e1a2559ed | type: PERMISSION --
GRANT SELECT
   ON ALL TABLES IN SCHEMA pms
   TO :rodbuser;
-- ddl-end --

ALTER DEFAULT PRIVILEGES IN SCHEMA pms
	GRANT SELECT ON TABLES TO :rodbuser;
-------------------------------------------------------------------------------------------	
	
\c mosip_keymgr sysadmin

-- object: grant_18180691b7 | type: PERMISSION --
GRANT CONNECT
   ON DATABASE mosip_keymgr
   TO :rodbuser;
-- ddl-end --

-- object: grant_3543fb6cf7 | type: PERMISSION --
GRANT USAGE
   ON SCHEMA keymgr
   TO :rodbuser;
-- ddl-end --

-- object: grant_8e1a2559ed | type: PERMISSION --
GRANT SELECT
   ON ALL TABLES IN SCHEMA keymgr
   TO :rodbuser;
-- ddl-end --

ALTER DEFAULT PRIVILEGES IN SCHEMA keymgr
	GRANT SELECT ON TABLES TO :rodbuser;
-------------------------------------------------------------------------------------------	
	
\c mosip_authdevice sysadmin

-- object: grant_18180691b7 | type: PERMISSION --
GRANT CONNECT
   ON DATABASE mosip_authdevice
   TO :rodbuser;
-- ddl-end --

-- object: grant_3543fb6cf7 | type: PERMISSION --
GRANT USAGE
   ON SCHEMA authdevice
   TO :rodbuser;
-- ddl-end --

-- object: grant_8e1a2559ed | type: PERMISSION --
GRANT SELECT
   ON ALL TABLES IN SCHEMA authdevice
   TO :rodbuser;
-- ddl-end --

ALTER DEFAULT PRIVILEGES IN SCHEMA authdevice
	GRANT SELECT ON TABLES TO :rodbuser;
-------------------------------------------------------------------------------------------	
	
\c mosip_regdevice sysadmin

-- object: grant_18180691b7 | type: PERMISSION --
GRANT CONNECT
   ON DATABASE mosip_regdevice
   TO :rodbuser;
-- ddl-end --

-- object: grant_3543fb6cf7 | type: PERMISSION --
GRANT USAGE
   ON SCHEMA regdevice
   TO :rodbuser;
-- ddl-end --

-- object: grant_8e1a2559ed | type: PERMISSION --
GRANT SELECT
   ON ALL TABLES IN SCHEMA regdevice
   TO :rodbuser;
-- ddl-end --

ALTER DEFAULT PRIVILEGES IN SCHEMA regdevice
	GRANT SELECT ON TABLES TO :rodbuser;
-------------------------------------------------------------------------------------------	
	
\c mosip_credential sysadmin

-- object: grant_18180691b7 | type: PERMISSION --
GRANT CONNECT
   ON DATABASE mosip_credential
   TO :rodbuser;
-- ddl-end --

-- object: grant_3543fb6cf7 | type: PERMISSION --
GRANT USAGE
   ON SCHEMA credential
   TO :rodbuser;
-- ddl-end --

-- object: grant_8e1a2559ed | type: PERMISSION --
GRANT SELECT
   ON ALL TABLES IN SCHEMA credential
   TO :rodbuser;
-- ddl-end --

ALTER DEFAULT PRIVILEGES IN SCHEMA credential
	GRANT SELECT ON TABLES TO :rodbuser;
-------------------------------------------------------------------------------------------	
	
\c mosip_websub sysadmin

-- object: grant_18180691b7 | type: PERMISSION --
GRANT CONNECT
   ON DATABASE mosip_websub
   TO :rodbuser;
-- ddl-end --

-- object: grant_3543fb6cf7 | type: PERMISSION --
GRANT USAGE
   ON SCHEMA websub
   TO :rodbuser;
-- ddl-end --

-- object: grant_8e1a2559ed | type: PERMISSION --
GRANT SELECT
   ON ALL TABLES IN SCHEMA websub
   TO :rodbuser;
-- ddl-end --

ALTER DEFAULT PRIVILEGES IN SCHEMA websub
	GRANT SELECT ON TABLES TO :rodbuser;