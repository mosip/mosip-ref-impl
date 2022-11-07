#!/bin/bash
# Built by MOSIP team
# Script to configure the BioSDK
set -e

echo "Configuring SDK"
mkdir -p /biosdk
cd /biosdk

echo "Download the biosdk from $biosdk_zip_url"
wget $biosdk_zip_url -O biosdk.zip
echo "Downloaded $biosdk_zip_url"

unzip biosdk.zip

exec "$@"
