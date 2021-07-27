# base image
FROM nginx

ENV base_path=/usr/share/nginx/html

ENV i18n_path=${base_path}/assets/i18n

ENV entity_spec_path=${base_path}/assets/entity-spec

COPY default.conf /etc/nginx/conf.d/

COPY dist ${base_path}

# can be passed during Docker build as build time environment for artifactory URL
ARG artifactory_url
# environment variable to pass artifactory url, at docker runtime
ENV artifactory_url_env=${artifactory_url}
# can be passed during Docker build as build time environment for glowroot 
ARG is_resource
# environment variable to pass glowroot, at docker runtime
ENV is_remote_resource_env=${is_resource}

# install the needed packages including wget and a unzip library 
RUN apt-get update -y && apt-get install -y wget && apt-get install -y unzip


#get the admin i18n bundle zip from artifactory
CMD if [ "$is_remote_resource_env" = "present" ]; then \
	rm -fr "${i18n_path}"/admin-i18n-bundle.zip;\
	wget -q --show-progress "${artifactory_url_env}"/artifactory/libs-release-local/i18n/admin-i18n-bundle.zip -O "${i18n_path}"/admin-i18n-bundle.zip;\
	rm -fr "${entity_spec_path}"/admin-entity-spec-bundle.zip;\
    wget -q --show-progress "${artifactory_url_env}"/artifactory/libs-release-local/i18n/admin-entity-spec-bundle.zip -O "${entity_spec_path}"/admin-entity-spec-bundle.zip;\
    cd ${entity_spec_path} ;\
    unzip admin-entity-spec-bundle.zip ;\
    cp -vrf -vf admin-entity-spec-bundle/entity-spec/* . ;\
    cd ${i18n_path} ;\
    unzip admin-i18n-bundle.zip ;\
    cp -vrf -vf admin-i18n-bundle/i18n/* .  ;\
    nginx ;\
    sleep infinity ;\
    else \
    cd ${entity_spec_path} ;\
    unzip admin-entity-spec-bundle.zip ;\
    cp -vrf -vf admin-entity-spec-bundle/entity-spec/* . ;\
    cd ${i18n_path} ;\
    unzip admin-i18n-bundle.zip ;\
    cp -vrf -vf admin-i18n-bundle/i18n/* .  ;\
    nginx ;\
    sleep infinity
    
   


