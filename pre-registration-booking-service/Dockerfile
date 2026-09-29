FROM eclipse-temurin:21-jre-alpine

ARG SOURCE
ARG COMMIT_HASH
ARG COMMIT_ID
ARG BUILD_TIME
LABEL source=${SOURCE}
LABEL commit_hash=${COMMIT_HASH}
LABEL commit_id=${COMMIT_ID}
LABEL build_time=${BUILD_TIME}

# Build-time config (also overridable at runtime via matching ENV).
ARG spring_config_label
ARG active_profile
ARG spring_config_url

ENV active_profile_env=${active_profile}
ENV spring_config_label_env=${spring_config_label}
ENV spring_config_url_env=${spring_config_url}

# JVM flags (ZGC, heap, encoding, …) come from JDK_JAVA_OPTIONS, set by Helm
# additionalResources.javaOpts — not hardcoded here.
# kernel-auth-adapter and kernel-ref-idobjectvalidator 1.4.1-SNAPSHOT are in the JAR.

ARG container_user=mosip
ARG container_user_group=mosip
ARG container_user_uid=1002
ARG container_user_gid=1001

RUN apk -q update \
&& addgroup -g ${container_user_gid} ${container_user_group} \
&& adduser -s /bin/sh -u ${container_user_uid} -G ${container_user_group} -h /home/${container_user} --disabled-password ${container_user}

WORKDIR /home/${container_user}

ENV work_dir=/home/${container_user}

ADD ./target/pre-registration-booking-service-*.jar pre-registration-booking-service.jar

RUN chown -R ${container_user}:${container_user} /home/${container_user}

USER ${container_user_uid}:${container_user_gid}

EXPOSE 9095

CMD java -Dspring.cloud.config.label="${spring_config_label_env}" \
    -Dspring.profiles.active="${active_profile_env}" \
    -Dspring.cloud.config.uri="${spring_config_url_env}" \
    -jar pre-registration-booking-service.jar
