FROM openjdk:11

ARG biosdk_jar_path

ARG biosdk_class

ENV biosdk_class=$biosdk_class

copy ./target/biosdk-services-*.jar biosdk-services.jar

RUN wget ${biosdk_jar_path} -P biosdk.jar

EXPOSE 9099

CMD ["java", "-Dloader.path=biosdk.jar", "-jar","biosdk-services.jar"]