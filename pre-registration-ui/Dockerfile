FROM ubuntu:18.04 AS builder

RUN apt-get -y update &&\
apt-get install -y unzip wget zip



# COPY dist dist

CMD mkdir -p /i18n;\
    wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip /i18n/pre-registration-i18n-bundle.zip;\
    cd /i18n/ ;\
    unzip pre-registration-i18n-bundle.zip;\
    mv pre-registration-i18n-bundle/* . ;\
    rm pre-registration-i18n-bundle.zip
 

FROM nginx
COPY default.conf /etc/nginx/conf.d/
COPY --from=builder i18n i18n
COPY --from=builder dist /usr/share/nginx/html
