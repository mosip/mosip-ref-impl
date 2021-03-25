# FROM nginx
# COPY default.conf /etc/nginx/conf.d/
# COPY dist /usr/share/nginx/html

# base image
# FROM ubuntu:18.04 AS builder
# # install the needed packages including wget and a unzip library 
# RUN apt-get update -y && apt-get install -y wget 
# RUN apt-get install -y unzip

# COPY dist dist
# get the pre-registration i18n bundle zip from artifactory

#     unzip pre-registration-i18n-bundle.zip;\
#     cp pre-registration-i18n-bundle/* /i18n
#     cp -o i18n/* /dist/assets/i18n 

FROM nginx


RUN apt-get -y update &&\
apt-get install -y unzip wget zip

RUN mkdir i18n
COPY default.conf /etc/nginx/conf.d/

COPY dist dist

CMD wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip pre-registration-i18n-bundle.zip;\
    unzip pre-registration-i18n-bundle.zip;\
    cp -rf pre-registration-i18n-bundle/* /i18n ;\
    cp -rf i18n/* /dist/assets/i18n ;\
    cp -rf dist /usr/share/nginx/html


