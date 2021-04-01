FROM nginx

RUN apt-get -y update &&\
apt-get install -y unzip wget zip

COPY dist dist

CMD wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip -O /dist/pre-registration/assets/i18n/pre-registration-i18n-bundle.zip;\
    cd dist/pre-registration/assets/i18n/ ;\
    unzip pre-registration-i18n-bundle.zip;\
    mv -f  pre-registration-i18n-bundle/* . ;\
    mv -f dist/pre-registration/* /usr/share/nginx/html

