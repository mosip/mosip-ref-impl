# FROM nginx
# COPY default.conf /etc/nginx/conf.d/
# COPY dist /usr/share/nginx/html

# base image
# FROM ubuntu:18.04 AS add-i18n
# # install the needed packages including wget and a unzip library 
# RUN apt-get update -y && apt-get install -y\
#  wget\
#  unzip
#  RUN mkdir i18n
#  COPY dist dist
# # get the pre-registration i18n bundle zip from artifactory
# CMD -q --show-progress wget http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip; \
#     unzip pre-registration-i18n-bundle.zip; \
#     mv /pre-registration-i18n-bundle/* /i18n/ ; \
#     mv /i18n /dist/assets/ ;\
 


# FROM nginx
# COPY default.conf /etc/nginx/conf.d/
# COPY --from=add-i18n dist /usr/share/nginx/html
FROM nginx
COPY dist dist
# install the needed packages including wget and a unzip library 
RUN apt-get update -y && apt-get install -y\
 wget\
 unzip
# get the pre-registration i18n bundle zip from artifactory
CMD wget -q pre-registration-i18n-bundle.zip pre-registration-i18n-bundle.zip;\
    mkdir i18n;\
    unzip pre-registration-i18n-bundle.zip;\
    mv /pre-registration-i18n-bundle/* /i18n/ ;\
    mv /i18n /dist/assets/ ;\
COPY default.conf /etc/nginx/conf.d/
COPY dist /usr/share/nginx/html
