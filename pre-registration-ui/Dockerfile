FROM nginx

RUN apt-get -y update &&\

apt-get install -y unzip wget zip 

COPY default.conf /etc/nginx/conf.d/

COPY dist /usr/share/nginx/html

CMD wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip -O pre-registration-i18n-bundle.zip;\
    unzip pre-registration-i18n-bundle.zip ;\
    cp -uvrf  pre-registration-i18n-bundle/* . ;\
    rm -rf pre-registration-i18n-bundle pre-registration-i18n-bundle.zip 
    mv -f *.json /usr/share/nginx/html/assets/i18n
 
ENTRYPOINT ["docker-entrypoint.sh"]
