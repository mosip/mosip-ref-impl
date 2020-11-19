FROM openjdk:11

ARG biosdk_jar_path

ARG biosdk_class

ENV biosdk_class=io.mosip.mock.sdk.impl.SampleSDK

copy ./target/biosdk-services-*.jar biosdk-services.jar

RUN wget http://52.172.8.144:8040/artifactory/libs-snapshot/io/mosip/mock/sdk/mock-sdk/1.1.2-SNAPSHOT/mock-sdk-1.1.2-SNAPSHOT.jar -O biosdk.jar

EXPOSE 9099

CMD ["java", "-Dloader.path=biosdk.jar", "-jar","biosdk-services.jar"]