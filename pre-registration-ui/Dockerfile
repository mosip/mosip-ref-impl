# FROM nginx
# COPY default.conf /etc/nginx/conf.d/
# COPY dist /usr/share/nginx/html

# base image
# FROM ubuntu:18.04 AS add-i18n
# COPY dist dist
# # install the needed packages including wget and a unzip library 
# RUN apt-get update -y && apt-get install -y\
#  wget\
#  unzip
# # get the pre-registration i18n bundle zip from artifactory
# COPY pre-registration-i18n-bundle.zip pre-registration-i18n-bundle.zip
# RUN mkdir i18n
# RUN unzip pre-registration-i18n-bundle.zip 
# RUN mv /pre-registration-i18n-bundle/* /i18n/
# RUN mv /i18n /dist/assets/
 


FROM nginx

RUN apt-get -y update &&\
apt-get install -y unzip wget zip

COPY default.conf /etc/nginx/conf.d/

COPY dist /usr/share/nginx/html

CMD mkdir -p /usr/share/nginx/html/assets/i18n1;\
   wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip usr/share/nginx/html/assets/i18n1/pre-registration-i18n-bundle.zip
#     cd usr/share/nginx/html/assets/i18n1/ ;\
#     unzip pre-registration-i18n-bundle.zip;\
#     mv pre-registration-i18n-bundle/* . ;\
#     rm pre-registration-i18n-bundle.zip 
