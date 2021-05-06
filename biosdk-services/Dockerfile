FROM openjdk:11

ENV biosdk_zip_url=$biosdk_zip_url
ENV biosdk_bioapi_impl=$biosdk_bioapi_impl

copy ./target/biosdk-services-*.jar /biosdk-services.jar
copy ./configure_sdk.sh /configure_sdk.sh

RUN chmod 777 /biosdk-services.jar

RUN chmod +x /configure_sdk.sh
RUN apt-get update

EXPOSE 9099

ENTRYPOINT [ "/configure_sdk.sh" ]

CMD java -Dloader.path="/biosdk/" -jar /biosdk-services.jar
