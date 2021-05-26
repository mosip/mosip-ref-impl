#!/bin/bash
# Built by MOSIP team
# Script to configure the BioSDK
set -e

echo "starting downloading zip file $biosdk_zip_file_path"

wget -q --show-progress "$biosdk_zip_file_path"
echo "Downloaded $biosdk_zip_file_path"

FILE_NAME=${biosdk_zip_file_path##*/}

echo $FILE_NAME

DIR_NAME=$biosdk_local_dir_name

#has_parent=$(zipinfo -1 "$FILE_NAME" | awk '{split($NF,a,"/");print a[1]}' | sort -u | wc -l)
#if test "$has_parent" -eq 1; then
#  echo "Zip has a parent directory inside"
#  dirname=$(zipinfo -1 "$FILE_NAME" | awk '{split($NF,a,"/");print a[1]}' | sort -u | head -n 1)
#  echo "Unzip directory"
#  unzip $FILE_NAME
#  echo "Renaming directory"
#  mv -v $dirname $DIR_NAME
#else
#  echo "Zip has no parent directory inside"
#  echo "Creating destination directory"
#  mkdir "$DIR_NAME"
#  echo "Unzip to destination directory"
#  unzip -d "$DIR_NAME" $FILE_NAME
#fi

unzip -d "$DIR_NAME" $FILE_NAME

echo "Copying to loader path"
cp -R ./$DIR_NAME/* $loader_path_env
echo "Complete"
cd $work_dir


#echo "Configuring SDK"
#mkdir -p /biosdk
#cd /biosdk

#echo "Download the biosdk from $biosdk_zip_url"
#wget $biosdk_zip_url -O biosdk.zip
#echo "Downloaded $biosdk_zip_url"
#
#unzip biosdk.zip

exec "$@"
