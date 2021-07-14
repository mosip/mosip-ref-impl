FROM jboss/keycloak:9.0.0

ARG SOURCE
ARG COMMIT_HASH
ARG COMMIT_ID
ARG BUILD_TIME
LABEL source=${SOURCE}
LABEL commit_hash=${COMMIT_HASH}
LABEL commit_id=${COMMIT_ID}
LABEL build_time=${BUILD_TIME}

ADD --chown=jboss:root ./theme/ ./theme

RUN cp -R ./theme/mosip /opt/jboss/keycloak/themes/mosip

RUN cp -R ./theme/base /opt/jboss/keycloak/themes

