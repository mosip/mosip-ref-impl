# base image
FROM nginx

ENV base_path=/usr/share/nginx/html

ENV i18n_path=${base_path}/assets/i18n

ENV entity_spec_path=${base_path}/assets/entity-spec

# can be passed during Docker build as build time environment for github branch to pickup configuration from.
ARG container_user=mosip

# can be passed during Docker build as build time environment for github branch to pickup configuration from.
ARG container_user_group=mosip

# can be passed during Docker build as build time environment for github branch to pickup configuration from.
ARG container_user_uid=1001

# can be passed during Docker build as build time environment for github branch to pickup configuration from.
ARG container_user_gid=1001

# install packages and create user
RUN apt-get -y update \
&& apt-get install -y unzip wget \
&& groupadd -g ${container_user_gid} ${container_user_group} \
&& useradd -u ${container_user_uid} -g ${container_user_group} -s /bin/sh -m ${container_user} \
&& mkdir -p /var/run/nginx /var/tmp/nginx \
&& chown -R ${container_user}:${container_user} /usr/share/nginx /var/run/nginx /var/tmp/nginx

# set working directory for the user
WORKDIR /home/${container_user}

ADD ./nginx.conf /etc/nginx/nginx.conf

ADD default.conf /etc/nginx/conf.d/

ADD dist ${base_path}

# install the needed packages including wget and a unzip library 
#RUN apt-get update -y && apt-get install -y wget && apt-get install -y unzip

# change permissions of file inside working dir
RUN chown -R ${container_user}:${container_user} ${base_path}/assets/i18n
RUN chown -R ${container_user}:${container_user} ${base_path}/assets/entity-spec

# select container user for all tasks
USER ${container_user_uid}:${container_user_gid}

EXPOSE 8080

#get the admin i18n bundle zip from artifactory
CMD wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/admin-i18n-bundle.zip -O "${i18n_path}"/admin-i18n-bundle.zip;\
    wget -q --show-progress http://artifactory-service/artifactory/libs-release-local/i18n/admin-entity-spec-bundle.zip -O "${entity_spec_path}"/admin-entity-spec-bundle.zip;\
    cd ${entity_spec_path} ;\
    unzip admin-entity-spec-bundle.zip ;\
    cp -vrf -vf admin-entity-spec-bundle/entity-spec/* . ;\
    cd ${i18n_path} ;\
    unzip admin-i18n-bundle.zip ;\
    cp -vrf -vf admin-i18n-bundle/i18n/* .  ;\
    nginx ;\
    sleep infinity