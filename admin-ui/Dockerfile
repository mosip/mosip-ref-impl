    
# FROM nginx
# COPY default.conf /etc/nginx/conf.d/
# COPY dist /usr/share/nginx/html

# base image
FROM ubuntu:18.04 AS add-i18n
COPY dist dist
# install the needed packages including wget and a unzip library 
RUN apt-get update -y && apt-get install -y wget && apt-get install -y unzip
RUN mkdir entity-spec
RUN mkdir i18n
# get the pre-registration i18n bundle zip from artifactory
CMD wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/admin-i18n-bundle.zip admin-i18n-bundle.zip ;\
    wget  -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/admin-entity-spec-bundle.zip admin-entity-spec-bundle.zip ;\
    unzip admin-entity-spec-bundle.zip ;\
    unzip admin-i18n-bundle.zip ;\
    mv /admin-i18n-bundle/* i18n/ ;\
    mv /admin-entity-spec-bundle/* entity-spec/ ;\
    mv /entity-spec /dist/assets/ ;\
    mv /i18n /dist/assets/
 


FROM nginx
COPY default.conf /etc/nginx/conf.d/
COPY --from=add-i18n dist /usr/share/nginx/html
