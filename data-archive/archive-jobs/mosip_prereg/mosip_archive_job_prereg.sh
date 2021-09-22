### -- ---------------------------------------------------------------------------------------------------------
### -- Script Name		: Pre Registration Archive Job
### -- Deploy Module 		: Pre registration
### -- Purpose    		: To Archive Pre Registration tables which are marked for archive.       
### -- Create By   		: Sadanandegowda DM
### -- Created Date		: Dec-2020
### -- 
### -- Modified Date		Modified By         	Comments / Remarks
### -- Sept-2021		Chandra Keshav Mishra	Updated to use python3
### -- ----------------------------------------------------------------------------------------

python3 mosip_archive_prereg_table1.py &
sleep 2m

python3 mosip_archive_prereg_table2.py &
sleep 2m

python3 mosip_archive_prereg_table3.py &
sleep 2m

python3 mosip_archive_prereg_table4.py

exit 1
