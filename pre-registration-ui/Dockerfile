FROM ubuntu:18.04 AS builder

RUN apt-get -y update &&\
apt-get install -y unzip wget zip

RUN mkdir i18n

COPY dist dist

CMD wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip pre-registration-i18n-bundle.zip;\
    unzip pre-registration-i18n-bundle.zip;\
    mv pre-registration-i18n-bundle/* i18n ;\
    mv i18n/* dist/assets/i18n ;\
    mv dist usr/share/nginx/html

FROM nginx
COPY default.conf /etc/nginx/conf.d/
COPY --from=builder dist /usr/share/nginx/html
