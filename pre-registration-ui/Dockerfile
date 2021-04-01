FROM nginx

RUN apt-get -y update &&\
apt-get install -y unzip wget zip

COPY dist dist

CMD mkdir -p /dist/pre-registration/assets/i18n-test;\
    wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip -O /dist/pre-registration/assets/i18n-test/pre-registration-i18n-bundle.zip;\
    cd dist/pre-registration/assets/i18n-test/ ;\
    unzip pre-registration-i18n-bundle.zip;\
    mv dist/pre-registration/* /usr/share/nginx/html

# 
# COPY default.conf /etc/nginx/conf.d/
# COPY --from=builder dist /usr/share/nginx/html
