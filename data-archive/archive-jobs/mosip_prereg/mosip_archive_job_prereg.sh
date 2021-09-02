### -- ---------------------------------------------------------------------------------------------------------
### -- Script Name		: Pre Registration Archive Job
### -- Deploy Module 		: Pre registration
### -- Purpose    		: To Archive Pre Registration tables which are marked for archive.       
### -- Create By   		: Sadanandegowda DM
### -- Created Date		: Dec-2020
### -- 
### -- Modified Date        Modified By         Comments / Remarks
### -- ----------------------------------------------------------------------------------------

python mosip_archive_prereg_table1.py &
sleep 5m

python mosip_archive_prereg_table2.py &
sleep 5m

python mosip_archive_prereg_table3.py &
sleep 5m

python mosip_archive_prereg_table4.py &

#===============================================================================================
