FROM ubuntu:18.04 AS builder

RUN apt-get -y update &&\
apt-get install -y unzip wget zip

COPY dist dist

RUN mkdir -p /dist/assets/i18n-test

CMD wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip -O /dist/assets/i18n-test/pre-registration-i18n-bundle.zip
#     cd dist/assets/i18n-test/ ;\
#     unzip pre-registration-i18n-bundle.zip;\
#     mv pre-registration-i18n-bundle/* . ;\
#     rm pre-registration-i18n-bundle.zip 


FROM nginx
COPY default.conf /etc/nginx/conf.d/
COPY --from=builder dist /usr/share/nginx/html
