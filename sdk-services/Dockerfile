FROM openjdk:11

copy ./target/sdk-services-*.jar sdk-services.jar

EXPOSE 9099

CMD ["java","-jar","sdk-services.jar"]