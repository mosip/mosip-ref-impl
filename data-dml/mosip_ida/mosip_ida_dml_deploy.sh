### -- ---------------------------------------------------------------------------------------------------------
### -- Script Name		: DML deploy
### -- Deploy Module 	: MOSIP AUTHENTICATION
### -- Purpose    		: To deploy Database DMLs.       
### -- Create By   		: Sadanandegowda DM
### -- Created Date		: Nov-2020
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
echo `date "+%m/%d/%Y %H:%M:%S"` ": ------------------ Database server and service status check for ${MOSIP_DB_NAME}------------------------"
##############################################LOG FILE CREATION#############################################################

today=`date '+%d%m%Y_%H%M%S'`;
LOG="${LOG_PATH}${MOSIP_DB_NAME}-dml-${today}.log"
touch $LOG


SERVICE=$(PGPASSWORD=$SU_USER_PWD  psql --username=$SU_USER --host=$DB_SERVERIP --port=$DB_PORT --dbname=$DEFAULT_DB_NAME -t -c "select count(1) from pg_roles where rolname IN('sysadmin')";exit; > /dev/null)

if [ "$SERVICE" -eq 0 ] || [ "$SERVICE" -eq 1 ]
then
echo `date "+%m/%d/%Y %H:%M:%S"` ": Postgres database server and service is up and running" | tee -a $LOG 2>&1
else
echo `date "+%m/%d/%Y %H:%M:%S"` ": Postgres database server or service is not running" | tee -a $LOG 2>&1
fi

echo `date "+%m/%d/%Y %H:%M:%S"` ": ----------------------------------------------------------------------------------------"

echo `date "+%m/%d/%Y %H:%M:%S"` ": Started sourcing the $MOSIP_DB_NAME Database DML scripts" | tee -a $LOG 2>&1
echo `date "+%m/%d/%Y %H:%M:%S"` ": Database scripts are sourcing from :$BASEPATH" | tee -a $LOG 2>&1

#========================================DB DML Deployment process begins on DB SERVER======================================

if [ ${DML_FLAG} == 1 ]
then
    echo `date "+%m/%d/%Y %H:%M:%S"` ": Deploying DML for ${MOSIP_DB_NAME} database" | tee -a $LOG 2>&1
    PGPASSWORD=$SYSADMIN_PWD psql --username=$SYSADMIN_USER --host=$DB_SERVERIP --port=$DB_PORT --dbname=$DEFAULT_DB_NAME -a -b -f $DML_FILENAME >> $LOG 2>&1
else
    echo `date "+%m/%d/%Y %H:%M:%S"` ": There are no DML deployment required for ${MOSIP_DB_NAME}" | tee -a $LOG 2>&1
fi

if [ $(grep -c ERROR $LOG) -ne 0 ]
then
    echo `date "+%m/%d/%Y %H:%M:%S"` ": Database DML deployment is completed with ERRORS, Please check the logs for more information" | tee -a $LOG 2>&1
	echo `date "+%m/%d/%Y %H:%M:%S"` ": END of MOSIP database deployment" | tee -a $LOG 2>&1
else
    echo `date "+%m/%d/%Y %H:%M:%S"` ": Database DML deployment completed successfully, Please check the logs for more information" | tee -a $LOG 2>&1
    echo `date "+%m/%d/%Y %H:%M:%S"` ": END of MOSIP \"${MOSIP_DB_NAME}\" database deployment" | tee -a $LOG 2>&1
fi 	

echo "******************************************"`date "+%m/%d/%Y %H:%M:%S"` "*****************************************************" >> $LOG 2>&1

#========================================DB DML Deployment process completes on DB SERVER======================================
