#-- -------------------------------------------------------------------------------------------------
#-- Job Name        : Audit DB Tables Archive
#-- DB Name 	    : mosip_audit
#-- Table Names     : app_audit_log
#-- Purpose    	    : Job to Archive Data in Audit DB for above mentioned tables         
#-- Create By       : Chandra Keshav Mishra
#-- Created Date    : Sept-2021
#-- 
#-- Modified Date        Modified By         Comments / Remarks
#-- ------------------------------------------------------------------------------------------
#-- 
#-- ------------------------------------------------------------------------------------------

#!/usr/bin/python
# -*- coding: utf-8 -*-
import sys

import configparser
import psycopg2
import datetime

from configparser import ConfigParser
from datetime import datetime

def config(filename='mosip_archive_audit.ini', section='MOSIP-DB-SECTION'):
    parser = ConfigParser()
    parser.read(filename)
    dbparam = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            dbparam[param[0]] = param[1]
    else:
        raise Exception('Section {0} not found in the {1} file'.format(section, filename))

    return dbparam

def getValues(row):
    finalValues =""
    for values in row:
        finalValues = finalValues+"'"+str(values)+"',"

    finalValues = finalValues[0:-1] 
    return finalValues

def dataArchive():
    sourseConn = None
    archiveConn = None
    try:
        
        dbparam = config()
        
        print('Connecting to the PostgreSQL database...')
        sourseConn = psycopg2.connect(user=dbparam["source_db_uname"],
                                password=dbparam["source_db_pass"],
                                host=dbparam["source_db_serverip"],
                                port=dbparam["source_db_port"],
                                database=dbparam["source_db_name"])
        archiveConn = psycopg2.connect(user=dbparam["archive_db_uname"],
                                password=dbparam["archive_db_pass"],
                                host=dbparam["archive_db_serverip"],
                                port=dbparam["archive_db_port"],
                                database=dbparam["archive_db_name"])
	
        sourceCur = sourseConn.cursor()
        archiveCur = archiveConn.cursor()

        tableName=dbparam["archive_table1"]
        sschemaName = dbparam["source_schema_name"]
        aschemaName = dbparam["archive_schema_name"]
        oldDays = dbparam["archive_older_than_days"]
        
        print(tableName)
        select_query = "SELECT * FROM "+sschemaName+"."+tableName+" WHERE cr_dtimes < NOW() - INTERVAL '"+oldDays+" days'"
        sourceCur.execute(select_query)
        rows = sourceCur.fetchall()
        select_count = sourceCur.rowcount
        print(select_count, ": Record selected for archive from ", tableName)
        if select_count > 0:
            for row in rows:
                rowValues = getValues(row)
                insert_query = "INSERT INTO "+aschemaName+"."+tableName+" VALUES ("+rowValues+")"
                archiveCur.execute(insert_query)
                archiveConn.commit()
                insert_count = archiveCur.rowcount
                print(insert_count, ": Record inserted successfully ")
                if insert_count > 0:
                    delete_query = "DELETE FROM "+sschemaName+"."+tableName+" WHERE id ='"+row[0]+"'"
                    sourceCur.execute(delete_query)
                    sourseConn.commit()
                    delete_count = sourceCur.rowcount
                    print(delete_count, ": Record deleted successfully") 
             
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if sourseConn is not None:
            sourceCur.close()
            sourseConn.close()
            print('Database sourse connection closed.')
        if archiveConn is not None:
            archiveCur.close()
            archiveConn.close()
            print('Database archive connection closed.')

if __name__ == '__main__':
    dataArchive()
