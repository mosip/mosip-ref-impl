#Archival Scripts

This archival Script here will be used to create the mosip_archive DB and archive all the Transactional Data into it.

## Steps to GO:
1. If we don't have mosip_archive DB than go ahead and continue with the [db_scrpts](db_scripts).
2. Else If we already have mosip_archive DB there and previously we have archived some transactional data do not use db_scripts. If db_scripts used more than once than the existing transactional data will be lost.
3. Once we have the mosip_archive DB ready we need to continue with the archive_jobs.
