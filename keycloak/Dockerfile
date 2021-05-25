FROM jboss/keycloak:11.0.3

#ADD --chown=jboss:root ./theme/mosip /opt/jboss/keycloak/themes

ADD --chown=jboss:root ./theme/ ./theme

RUN cp -R ./theme/mosip /opt/jboss/keycloak/themes/

RUN cp -R ./theme/base /opt/jboss/keycloak/themes/

