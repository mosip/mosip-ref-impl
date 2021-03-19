# base image
FROM node:12.2.0

COPY dist .
# get the pre-registration i18n bundle zip from artifactory
CMD wget http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip \
    unzip pre-registration-i18n-bundle.zip -d dist/assets/1i8n \ ls


FROM nginx
COPY default.conf /etc/nginx/conf.d/
COPY --from=0 dist /usr/share/nginx/html
