-- object: archiveuser | type: ROLE --
-- DROP ROLE IF EXISTS archiveuser;
CREATE ROLE archiveuser WITH 
	INHERIT
	LOGIN
	PASSWORD :dbuserpwd;
-- ddl-end --
