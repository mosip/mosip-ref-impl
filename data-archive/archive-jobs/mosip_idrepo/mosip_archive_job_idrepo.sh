### -- ---------------------------------------------------------------------------------------------------------
### -- Script Name		: ID Repository Archive Job
### -- Deploy Module 		: Id Repository
### -- Purpose    		: To Archive ID Repository tables which are marked for archive.       
### -- Create By   		: Sadanandegowda DM
### -- Created Date		: Dec-2020
### -- 
### -- Modified Date		Modified By		Comments / Remarks
### -- Sept-2021		Chandra Keshav Mishra	Updated to use the python3
### -- ----------------------------------------------------------------------------------------

python3 mosip_archive_idrepo_table1.py &
sleep 2m

python3 mosip_archive_idrepo_table2.py &
sleep 2m

python3 mosip_archive_idrepo_table3.py
#-- ===============================================================================================
