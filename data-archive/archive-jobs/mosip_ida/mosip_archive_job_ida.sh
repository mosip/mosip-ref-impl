### -- ---------------------------------------------------------------------------------------------------------
### -- Script Name		: IDA Archive Job
### -- Deploy Module 	: IDA
### -- Purpose    		: To Archive IDA tables which are marked for archive.       
### -- Create By   		: Sadanandegowda DM
### -- Created Date		: Dec-2020
### -- 
### -- Modified Date        Modified By         Comments / Remarks
### -- ----------------------------------------------------------------------------------------

python mosip_archive_ida_table1.py &
sleep 5m

python mosip_archive_ida_table2.py &

#===============================================================================================
