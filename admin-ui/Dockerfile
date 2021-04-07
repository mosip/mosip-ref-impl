# base image
FROM nginx

ENV base_path=/usr/share/nginx/html

ENV i18n_path=${base_path}/assets/i18n

ENV entity_spec_path=${base_path}/assets/entity-spec

COPY default.conf /etc/nginx/conf.d/

COPY dist ${base_path}

# install the needed packages including wget and a unzip library 
RUN apt-get update -y && apt-get install -y wget && apt-get install -y unzip


# get the admin i18n bundle zip from artifactory
CMD wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/admin-i18n-bundle.zip -O "${i18n_path}"/admin-i18n-bundle.zip;\
    wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/admin-entity-spec-bundle.zip -O "${entity_spec_path}"/admin-entity-spec-bundle.zip;\
    cd ${entity_spec_path} ;\
    unzip admin-entity-spec-bundle.zip ;\
    mv -vf admin-entity-spec-bundle/* . ;\
    cd ${i18n_path} ;\
    unzip admin-i18n-bundle.zip ;\
    mv -vf admin-i18n-bundle/* . 
   


