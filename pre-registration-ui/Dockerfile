FROM nginx

RUN apt-get -y update &&\
apt-get install -y unzip wget zip

COPY default.conf /etc/nginx/conf.d/

COPY dist /usr/share/nginx/html



CMD wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip -O /usr/share/nginx/html/assets/i18n/pre-registration-i18n-bundle.zip;\
    cd /usr/share/nginx/html/assets/i18n/ ;\
    unzip pre-registration-i18n-bundle.zip ;\
    mv -f  pre-registration-i18n-bundle/* . 
    
# FROM nginx
# COPY default.conf /etc/nginx/conf.d/
# COPY dist /usr/share/nginx/html
