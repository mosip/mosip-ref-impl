# base image
FROM node:12.2.0

# get the pre-registration i18n bundle zip from artifactory
RUN wget -q -O http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip
COPY dist .
RUN unzip pre-registration-i18n-bundle.zip -d dist/assets/1i8n 


FROM nginx
COPY default.conf /etc/nginx/conf.d/
COPY --from=0 dist /usr/share/nginx/html
