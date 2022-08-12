#-- -------------------------------------------------------------------------------------------------
#-- Job Name        : Credential DB Tables Archive
#-- DB Name 	    : mosip_archive
#-- Table Names     : credential_transaction
#-- Purpose    	    : Job to Archive Data in mosip_archive database for the tables mentioned in the script
#-- Create By       : Kamesh Shekhar Prasad
#-- Created Date    : Aug-2022
#-- 
#-- Modified Date        Modified By         Comments / Remarks
#-- ------------------------------------------------------------------------------------------
#-- 
#-- ------------------------------------------------------------------------------------------

#!/usr/bin/python3
# -*- coding: utf-8 -*-
import sys

import configparser
import psycopg2
import datetime
import json

from configparser import ConfigParser
from datetime import datetime

def config(filename='mosip_archive_credential.ini', section='MOSIP-DB-SECTION'):
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
        if values is not None:
            finalValues = finalValues+"'"+str(escape(values))+"',"
        else:
            finalValues = finalValues +"null,"
    finalValues = finalValues[0:-1]
    return finalValues

def escape(st):
    if isinstance(st, str) and "'" in st:
        return st.replace('\'', '\'\'')
    else:
        return st

def convertStringToMap(credentialStatusTime):
    credentialStatusTimeMap = {}
    credentialStatusTimeList = credentialStatusTime.split(",")
    for credentialStatusTime in credentialStatusTimeList:
        credentialStatusTimeMap[credentialStatusTime.split(":")[0]] = credentialStatusTime.split(":")[1]
    return credentialStatusTimeMap

def convertStringToLiteralString(credentialEndStatusList):
    print(credentialEndStatusList)
    credentialEndStatus = credentialEndStatusList.split(",")
    finalString = ""
    for credentialEndStatus in credentialEndStatus:
        finalString = finalString + "'" + credentialEndStatus + "',"
    finalString = finalString[0:-1]
    return finalString

def moveRecords(query, sourceCur, aschemaName, tableName, archiveCur, archiveConn, sschemaName, sourseConn):
    sourceCur.execute(query)
    rows = sourceCur.fetchall()
    select_count = sourceCur.rowcount
    print(select_count, ": Record selected for archive from ", tableName)
    for row in rows:
        finalValues = getValues(row)
        archiveCur.execute("INSERT INTO "+aschemaName+"."+tableName+" VALUES ("+finalValues+");")
        archiveConn.commit()
        print("Inserted into "+aschemaName+"."+tableName)
        sourceCur.execute("DELETE FROM "+sschemaName+"."+tableName+" WHERE id ='"+row[0]+"'"+";")
        sourseConn.commit()
        print("Deleted from "+sschemaName+"."+tableName)

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
        credentialStatusTime = dbparam["credential.status.time.map"]
        credentialEndStatusList= dbparam["credential.endstatus.list"]
        credentialStatusTimeMap = convertStringToMap(credentialStatusTime)
        print(tableName)

        for(statusCode,statusTime) in credentialStatusTimeMap.items():
            print(statusCode)
            print(statusTime)
            query = "SELECT * FROM "+sschemaName+"."+tableName+" WHERE status_code ='"+statusCode+"' and cr_dtimes < NOW() - INTERVAL '"+statusTime+" days';"
            moveRecords(query, sourceCur, aschemaName, tableName, archiveCur, archiveConn, sschemaName, sourseConn)

        credentialEndStatusListString = convertStringToLiteralString(credentialEndStatusList)
        select_query = "SELECT * FROM "+sschemaName+"."+tableName+" WHERE status_code in("+credentialEndStatusListString+")"
        moveRecords(select_query, sourceCur, aschemaName, tableName, archiveCur, archiveConn, sschemaName, sourseConn)

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
