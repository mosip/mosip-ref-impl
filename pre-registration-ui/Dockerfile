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
COPY pre-registration-i18n-bundle.zip pre-registration-i18n-bundle.zip
RUN mkdir i18n
RUN unzip pre-registration-i18n-bundle.zip 
RUN mv /pre-registration-i18n-bundle/* /i18n/
RUN mv /i18n /dist/assets/
 


FROM nginx
COPY default.conf /etc/nginx/conf.d/
COPY --from=add-i18n dist /usr/share/nginx/html
