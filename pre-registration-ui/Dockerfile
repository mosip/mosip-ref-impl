FROM nginx

RUN apt-get -y update &&\
apt-get install -y unzip wget zip

ENV base_path=/usr/share/nginx/html

ENV i18n_path=${base_path}/assets/i18n

COPY default.conf /etc/nginx/conf.d/

COPY dist ${base_path}

CMD wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip -O "${i18n_path}"/pre-registration-i18n-bundle.zip;\
   cd ${i18n_path} ;\
   unzip pre-registration-i18n-bundle.zip ;\
   cp -vrf  "${i18n_path}"/pre-registration-i18n-bundle/* . ;\
   nginx ;\
   sleep infinity
    
