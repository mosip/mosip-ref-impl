#!/bin/bash

#installs the pre-requisites.
set -e

echo "Downloading pre-requisites install scripts"
wget --no-check-certificate --no-cache --no-cookies $artifactory_url_env/artifactory/libs-release-local/i18n/admin-i18n-bundle.zip -O $i18n_path/admin-i18n-bundle.zip
wget --no-check-certificate --no-cache --no-cookies $artifactory_url_env/artifactory/libs-release-local/i18n/admin-entity-spec-bundle.zip -O $entity_spec_path/admin-entity-spec-bundle.zip
wget --no-check-certificate --no-cache --no-cookies $artifactory_url_env/artifactory/libs-release-local/master-templates/master-templates.zip -O $master_template_path/master-templates.zip

echo "unzip pre-requisites.."
chmod 775 $i18n_path/*
chmod 775 $master_template_path/*

cd $entity_spec_path
unzip -o admin-entity-spec-bundle.zip
cd $i18n_path
unzip -o admin-i18n-bundle.zip
cd $master_template_path
unzip -o master-templates.zip

echo "unzip pre-requisites completed."

exec "$@"