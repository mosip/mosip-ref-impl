FROM ubuntu:18.04 AS builder

RUN apt-get -y update &&\
apt-get install -y unzip wget zip

RUN mkdir i18n1

COPY dist dist

CMD wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip pre-registration-i18n-bundle.zip;\
    unzip pre-registration-i18n-bundle.zip -d /home;\
    cp /home/pre-registration-i18n-bundle/* /i18n1 
#     mv i18n1 /dist/assets 
#     mv dist /usr/share/nginx/html

FROM nginx
COPY default.conf /etc/nginx/conf.d/
COPY --from=builder i18n1 i18n1
COPY --from=builder dist /usr/share/nginx/html
