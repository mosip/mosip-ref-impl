# FROM nginx

# RUN apt-get -y update &&\
# apt-get install -y unzip wget zip

# COPY dist dist

# CMD wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip -O /dist/assets/i18n/pre-registration-i18n-bundle.zip;\
#     cd dist/assets/i18n/ ;\
#     unzip pre-registration-i18n-bundle.zip;\
#     mv -f  pre-registration-i18n-bundle/* . ;\
#     mv -f dist/* /usr/share/nginx/html

FROM nginx
COPY default.conf /etc/nginx/conf.d/
COPY dist/pre-registration /usr/share/nginx/html
