# FROM nginx
# COPY default.conf /etc/nginx/conf.d/
# COPY dist /usr/share/nginx/html

# base image
FROM ubuntu:18.04 AS add-i18n
COPY dist dist
COPY pre-registration-i18n-bundle.zip pre-registration-i18n-bundle.zip
# install the needed packages including wget and a unzip library 
RUN apt-get update -y && apt-get install -y\
 wget\
 unzip
# get the pre-registration i18n bundle zip from artifactory
RUN mkdir i18n
RUN unzip pre-registration-i18n-bundle.zip -d /i18n
CMD unzip pre-registration-i18n-bundle.zip 


FROM nginx
COPY default.conf /etc/nginx/conf.d/
COPY --from=add-i18n pre-registration-i18n-bundle.zip pre-registration-i18n-bundle.zip
COPY --from=add-i18n pre-registration-i18n-bundle pre-registration-i18n-bundle
COPY --from=add-i18n i18n i18n
COPY --from=add-i18n dist /usr/share/nginx/html
