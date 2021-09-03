### -- ---------------------------------------------------------------------------------------------------------
### -- Script Name		: ID Repository Archive Job
### -- Deploy Module 		: Id Repository
### -- Purpose    		: To Archive ID Repository tables which are marked for archive.       
### -- Create By   		: Sadanandegowda DM
### -- Created Date		: Dec-2020
### -- 
### -- Modified Date        Modified By         Comments / Remarks
### -- ----------------------------------------------------------------------------------------

python mosip_archive_idrepo_table1.py &
sleep 5m

python mosip_archive_idrepo_table2.py &
sleep 5m

python mosip_archive_idrepo_table3.py &

#===============================================================================================
