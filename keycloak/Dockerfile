FROM jboss/keycloak:9.0.0

ADD --chown=jboss:root ./theme/ ./theme

RUN cp -R ./theme/mosip /opt/jboss/keycloak/themes/mosip

RUN cp -R ./theme/base /opt/jboss/keycloak/themes


ADD --chown=jboss:root ./standalone/ ./standalone

RUN cp -R ./standalone/deployments/* /opt/jboss/keycloak/standalone/deployments

