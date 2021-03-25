    
# FROM nginx
# COPY default.conf /etc/nginx/conf.d/
# COPY dist /usr/share/nginx/html

# base image
FROM ubuntu:18.04 AS add-i18n
COPY dist dist
# install the needed packages including wget and a unzip library 
RUN apt-get update -y && apt-get install -y\
 wget\
 unzip
RUN mkdir entity-spec
RUN mkdir i18n
# get the pre-registration i18n bundle zip from artifactory
RUN wget http://artifactory-service/artifactory/libs-release-local/i18n/admin-i18n-bundle.zip &&\
    wget http://artifactory-service/artifactory/libs-release-local/i18n/admin-entity-spec-bundle.zip &&\
    unzip admin-entity-spec-bundle.zip &&\
    unzip admin-i18n-bundle.zip &&\
    mv /admin-i18n-bundle/* i18n/ &&\
    mv /admin-entity-spec-bundle/* entity-spec/ &&\
    cp -rf entity-spec/* /dist/assets/entity-spec/ &&\
    cp -rf i18n/* /dist/assets/i18n/
 


FROM nginx
COPY default.conf /etc/nginx/conf.d/
COPY --from=add-i18n i18n i18n
COPY --from=add-i18n entity-spec entity-spec
COPY --from=add-i18n dist /usr/share/nginx/html
