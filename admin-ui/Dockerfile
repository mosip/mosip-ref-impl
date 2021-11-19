# base image
FROM nginx

ENV base_path=/usr/share/nginx/html

ENV i18n_path=${base_path}/assets/i18n

ENV entity_spec_path=${base_path}/assets/entity-spec

ENV master_template_path=${base_path}/templates


# can be passed during Docker build as build time environment for github branch to pickup configuration from.
ARG container_user=mosip

# can be passed during Docker build as build time environment for github branch to pickup configuration from.
ARG container_user_group=mosip

# can be passed during Docker build as build time environment for github branch to pickup configuration from.
ARG container_user_uid=1001

# can be passed during Docker build as build time environment for github branch to pickup configuration from.
ARG container_user_gid=1001

# can be passed during Docker build as build time environment for artifactory URL
ARG artifactory_url

# environment variable to pass artifactory url, at docker runtime
ENV artifactory_url_env=${artifactory_url}

# install packages and create user
RUN apt-get -y update \
&& apt-get install -y unzip wget zip npm \
&& groupadd -g ${container_user_gid} ${container_user_group} \
&& useradd -u ${container_user_uid} -g ${container_user_group} -s /bin/sh -m ${container_user} \
&& mkdir -p /var/run/nginx /var/tmp/nginx \
&& chown -R ${container_user}:${container_user} /usr/share/nginx /var/run/nginx /var/tmp/nginx

# set working directory for the user
WORKDIR /home/${container_user}

ADD ./nginx.conf /etc/nginx/nginx.conf

ADD ./default.conf /etc/nginx/conf.d/

ADD ./download.conf /etc/nginx/include/download.conf

RUN mkdir application && cd application

COPY ["angular.json", "karma.conf.js", "package.json", "proxy.conf.json", "tsconfig.app.json","tsconfig.json","tsconfig.spec.json","tslint.json"]

ADD ./src ./src

RUN cd /home/${container_user}

ADD dist ${base_path}

# install the needed packages including wget and a unzip library 
#RUN apt-get update -y && apt-get install -y wget && apt-get install -y unzip

# change permissions of file inside working dir
RUN chown -R ${container_user}:${container_user} ${base_path}/assets/i18n
RUN chown -R ${container_user}:${container_user} ${base_path}/assets/entity-spec
RUN mkdir -p ${master_template_path} && chown -R ${container_user}:${container_user} ${master_template_path}


ADD configure_start.sh configure_start.sh

RUN chmod +x configure_start.sh

RUN chown -R ${container_user}:${container_user} /home/${container_user}

# select container user for all tasks
USER ${container_user_uid}:${container_user_gid}

EXPOSE 8080

ENTRYPOINT [ "./configure_start.sh" ]

#get the admin i18n bundle zip from artifactory
CMD echo "starting nginx" ; \
#    wget -q --show-progress "${artifactory_url_env}"/artifactory/libs-release-local/i18n/admin-i18n-bundle.zip -O "${i18n_path}"/admin-i18n-bundle.zip ; \
#    echo "Downloading entity spec bundle" ; \
#    wget -q --show-progress "${artifactory_url_env}"/artifactory/libs-release-local/i18n/admin-entity-spec-bundle.zip -O "${entity_spec_path}"/admin-entity-spec-bundle.zip ; \
#    echo "Downloading templates bundle" ; \
#    wget -q --show-progress "${artifactory_url_env}"/artifactory/libs-release-local/master-templates/master-templates.zip -O "${master_template_path}"/master-templates.zip ; \
#    cd ${entity_spec_path} ; \
#    #zip -FF admin-entity-spec-bundle.zip --out admin-entity-spec-bundle_fixed.zip ; \
#    unzip -o admin-entity-spec-bundle.zip ; \
#    cd ${i18n_path} ; \
#    #zip -FF admin-i18n-bundle.zip --out admin-i18n-bundle_fixed.zip ; \
#    unzip -o admin-i18n-bundle.zip ; \
#    cd ${master_template_path} ; \
#    #zip -FF master-templates.zip --out master-templates_fixed.zip ; \
#    unzip -o master-templates.zip ; \
    nginx ; \
    sleep infinity

	
