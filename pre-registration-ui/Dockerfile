# base image
FROM node:12.2.0 AS add-i18n
WORKDIR /home/pre-registration-ui
COPY dist .
# get the pre-registration i18n bundle zip from artifactory
CMD wget http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip \
    unzip pre-registration-i18n-bundle.zip -d dist/assets/1i8n 
CMD pwd


FROM nginx
COPY default.conf /etc/nginx/conf.d/
COPY --from=add-i18n /home/pre-registration-ui/dist /usr/share/nginx/html
