FROM openjdk:11

ARG biosdk_zip_url

ENV biosdk_zip_file_path=${biosdk_zip_url}

ARG biosdk_local_dir=biosdk-client

ENV biosdk_local_dir_name=${biosdk_local_dir}

#ENV biosdk_zip_url=$biosdk_zip_url
ENV biosdk_bioapi_impl=$biosdk_bioapi_impl

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
&& apt-get install -y unzip sudo\
&& groupadd -g ${container_user_gid} ${container_user_group} \
&& useradd -u ${container_user_uid} -g ${container_user_group} -s /bin/sh -m ${container_user}

# set working directory for the user
WORKDIR /home/${container_user}

ENV work_dir=/home/${container_user}

ARG loader_path=${work_dir}/additional_jars/

RUN mkdir -p ${loader_path}

ENV loader_path_env=${loader_path}

ADD ./target/biosdk-services-*.jar biosdk-services.jar

ADD ./configure_biosdk.sh configure_biosdk.sh

RUN chmod 775 biosdk-services.jar

RUN chmod +x configure_biosdk.sh

# change permissions of file inside working dir
RUN chown -R ${container_user}:${container_user} /home/${container_user}

# select container user for all tasks
USER ${container_user_uid}:${container_user_gid}

EXPOSE 9099

ENTRYPOINT [ "./configure_biosdk.sh" ]

CMD java -Dloader.path="${loader_path_env}" -jar biosdk-services.jar
