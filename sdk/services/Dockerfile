FROM openjdk:11

ARG mosip_sdk_biosdk_path

ARG mosip_sdk_biosdk_lib

ENV mosip_sdk_biosdk_lib=${mosip_sdk_biosdk_lib}

copy ./target/services-*.jar services.jar

RUN wget ${mosip_sdk_biosdk_path}

EXPOSE 9099

CMD ["java", "-Dloader.path=mock-sdk-0.9.jar", "-jar","services.jar"]