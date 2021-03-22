# FROM nginx
# COPY default.conf /etc/nginx/conf.d/
# COPY dist /usr/share/nginx/html

# base image
FROM node:12.2.0 AS add-i18n
COPY dist dist
# get the pre-registration i18n bundle zip from artifactory
CMD wget home/mosip/http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip \
    unzip pre-registration-i18n-bundle.zip -d dist/assets/i18n 


FROM nginx
COPY default.conf /etc/nginx/conf.d/
COPY --from=add-i18n dist /usr/share/nginx/html
