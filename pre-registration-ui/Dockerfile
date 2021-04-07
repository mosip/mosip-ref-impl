FROM nginx

RUN apt-get -y update &&\
apt-get install -y unzip wget zip

COPY dist dist

COPY default.conf /etc/nginx/conf.d/

CMD wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip -O /dist/assets/i18n/pre-registration-i18n-bundle.zip;\
    cd dist/assets/i18n/ ;\
    unzip pre-registration-i18n-bundle.zip;\
    mv -f  pre-registration-i18n-bundle/* . ;\
    cd / ;\
    mv -ur dist/* /usr/share/nginx/html

# FROM nginx
# COPY default.conf /etc/nginx/conf.d/
# COPY --from=add-i18n dist /usr/share/nginx/html
