# FROM nginx
# COPY default.conf /etc/nginx/conf.d/
# COPY dist /usr/share/nginx/html

# base image
FROM ubuntu:18.04 AS builder
# install the needed packages including wget and a unzip library 
RUN apt-get update -y && apt-get install -y wget && apt-get install -y unzip
RUN mkdir i18n
COPY dist dist
# get the pre-registration i18n bundle zip from artifactory
CMD wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip pre-registration-i18n-bundle.zip; \
  unzip pre-registration-i18n-bundle.zip
#   mv /pre-registration-i18n-bundle/* /i18n
#   mv /i18n/* /dist/assets/ 

FROM nginx
COPY default.conf /etc/nginx/conf.d/
COPY --from=builder pre-registration-i18n-bundle pre-registration-i18n-bundle
COPY --from=builder dist dist
COPY dist /usr/share/nginx/html
