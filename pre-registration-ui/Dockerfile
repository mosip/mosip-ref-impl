FROM nginx
COPY default.conf /etc/nginx/conf.d/
RUN wget http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip
RUN  unzip pre-registration-i18n-bundle.zip -d dist/assets/1i8n
COPY dist /usr/share/nginx/html
