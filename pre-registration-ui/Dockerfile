# FROM nginx

# RUN apt-get -y update &&\
# apt-get install -y unzip wget zip

# COPY default.conf /etc/nginx/conf.d/

# COPY dist /usr/share/nginx/html

# CMD mkdir -p /usr/share/nginx/html/assets/i18n1;\
#    wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/pre-registration-i18n-bundle.zip /usr/share/nginx/html/assets/i18n1/pre-registration-i18n-bundle.zip;\
#     cd usr/share/nginx/html/assets/i18n1/ ;\
#     unzip pre-registration-i18n-bundle.zip;\
#     mv pre-registration-i18n-bundle/* . ;\
#     rm pre-registration-i18n-bundle.zip 


FROM nginx
COPY default.conf /etc/nginx/conf.d/
COPY --from=builder dist dist
COPY dist /usr/share/nginx/htm
