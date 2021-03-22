## MOSIP Read-Only user creation. 

#### The details disclosed below gives a clear information on complete script structure with the instructions for user creation scripts deployments.

## Prerequisities

* DB Server and access details

* Postgres client (psql) has to be installed on the deployment servers.

* Copy latest database scripts(SQL, Properties, .SH ... etc) from git/repository on to the DB deployment server.

* Updated properties file for the releavnt variables being used.


## Create Read Only user :
		
**Step 1** -> Set below environment variables on the servers.
	SU_USER_PWD  -- Super user (postgres) password for the Postgres server
	SYSADMIN_PWD -- Sysadmin user (Created while deploying MOSIP database artifacts) password
	RO_DBUSER_PWD -- Read only user password

**Step 2** -> Run below command to create the read-only user with required access grants

<em> **Enter:-bash-4.2$** cd /home/madmin/database/create-user </em>

<em> **Enter:-bash-4.2$** bash mosip_readonly_user_create.sh mosip_readonly_user.properties </em>

