    
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
# get the pre-registration i18n bundle zip from artifactory
CMD wget http://artifactory-service/artifactory/libs-release-local/i18n/admin-i18n-bundle.zip \
    wget http://artifactory-service/artifactory/libs-release-local/i18n/admin-entity-spec-bundle.zip
RUN mkdir entity-spec
RUN mkdir i18n
RUN unzip admin-entity-spec-bundle.zip 
RUN unzip admin-i18n-bundle.zip
RUN mv /admin-i18n-bundle/* /i18n/
RUN mv /admin-entity-spec-bundle/* /entity-spec/
RUN mv -f /entity-spec /dist/assets/
RUN mv -f /i18n /dist/assets/
 


FROM nginx
COPY default.conf /etc/nginx/conf.d/
COPY --from=add-i18n dist /usr/share/nginx/html
