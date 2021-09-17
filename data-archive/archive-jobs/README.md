# Archive Jobs

The jobs present here archives the transactional data. 

## Prerequisites
1. Install python3.9 virtual env.
2. Switch to virtual env.
3. Install required psycopg dependency.
	`sudo yum install python3-psycopg

## Execution Steps
1. Update the `*.ini` file present inside each db archival jobs directory with required source and destination DB details.
2. Execute the archive_job.sh present there.
	`sh mosip_archive_job_<schema>.sh` 

