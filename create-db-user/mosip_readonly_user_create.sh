### -- ---------------------------------------------------------------------------------------------------------
### -- Script Name		: Read-only User Creation
### -- Deploy Module 	: MOSIP ALL
### -- Purpose    		: To Create MOSIP Read-only user for all DBs.       
### -- Create By   		: Sadanandegowda DM
### -- Created Date		: Jan-2021
### -- 
### -- Modified Date        Modified By         Comments / Remarks
### -- -----------------------------------------------------------------------------------------------------------

#########Properties file #############
set -e
properties_file="$1"
echo `date "+%m/%d/%Y %H:%M:%S"` ": $properties_file"
#properties_file="./app.properties"
if [ -f "$properties_file" ]
then
    echo `date "+%m/%d/%Y %H:%M:%S"` ": Property file \"$properties_file\" found."
    while IFS='=' read -r key value
    do
        key=$(echo $key | tr '.' '_')
         eval ${key}=\${value}
   done < "$properties_file"
else
    echo `date "+%m/%d/%Y %H:%M:%S"` ": Property file not found, Pass property file name as argument."
fi
echo `date "+%m/%d/%Y %H:%M:%S"` ": ------------------ Database server and service status check for ${DEFAULT_DB_NAME}------------------------"
##############################################LOG FILE CREATION#############################################################

today=`date '+%d%m%Y_%H%M%S'`;
LOG="${LOG_PATH}${DEFAULT_DB_NAME}-${today}.log"
touch $LOG


SERVICE=$(PGPASSWORD=$SU_USER_PWD  psql --username=$SU_USER --host=$DB_SERVERIP --port=$DB_PORT --dbname=$DEFAULT_DB_NAME -t -c "select count(1) from pg_roles where rolname IN('sysadmin')";exit; > /dev/null)

if [ "$SERVICE" -eq 0 ] || [ "$SERVICE" -eq 1 ]
then
	echo `date "+%m/%d/%Y %H:%M:%S"` ": Postgres database server and service is up and running" | tee -a $LOG 2>&1
else
	echo `date "+%m/%d/%Y %H:%M:%S"` ": Postgres database server or service is not running" | tee -a $LOG 2>&1
fi

echo `date "+%m/%d/%Y %H:%M:%S"` ": ----------------------------------------------------------------------------------------"

echo `date "+%m/%d/%Y %H:%M:%S"` ": Started sourcing the SQL scripts" | tee -a $LOG 2>&1

#========================================User Creation process begins on DB SERVER======================================


MASTERCONN=$(PGPASSWORD=$SU_USER_PWD  psql --username=$SU_USER --host=$DB_SERVERIP --port=$DB_PORT --dbname=$DEFAULT_DB_NAME -t -c "select count(1) from pg_roles where rolname IN('$RO_DBUSER')";exit; >> $LOG 2>&1)

if [ ${MASTERCONN} == 0 ]
then
    echo `date "+%m/%d/%Y %H:%M:%S"` ": Creating database read-only user" | tee -a $LOG 2>&1
    PGPASSWORD=$SYSADMIN_PWD psql --username=$SYSADMIN_USER --host=$DB_SERVERIP --port=$DB_PORT --dbname=$DEFAULT_DB_NAME -f $RO_ROLE_FILENAME -v rodbuserpwd=\'$RO_DBUSER_PWD\' -v rodbuser=$RO_DBUSER >> $LOG 2>&1
else
    echo `date "+%m/%d/%Y %H:%M:%S"` ": Database read-only user already exist" | tee -a $LOG 2>&1
fi


if [ $(grep -c ERROR $LOG) -ne 0 ]
then
    echo `date "+%m/%d/%Y %H:%M:%S"` ": User Creation is completed with ERRORS, Please check the logs for more information" | tee -a $LOG 2>&1
	echo `date "+%m/%d/%Y %H:%M:%S"` ": END of Read-only user Creation deployment" | tee -a $LOG 2>&1
else
    echo `date "+%m/%d/%Y %H:%M:%S"` ": Database read-only user creation completed successfully, Please check the logs for more information" | tee -a $LOG 2>&1
fi 	

echo "******************************************"`date "+%m/%d/%Y %H:%M:%S"` "*****************************************************" >> $LOG 2>&1

#========================================DB Deployment process completes on MASTER DB SERVER======================================
