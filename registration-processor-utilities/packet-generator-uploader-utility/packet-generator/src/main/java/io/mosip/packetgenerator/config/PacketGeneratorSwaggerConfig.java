package io.mosip.packetgenerator.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;
/**
 * 
 * @author Girish Yarru
 *
 */
@Configuration
@EnableSwagger2
public class PacketGeneratorSwaggerConfig {
	@Bean
	public Docket swaggerConfigurations() {
		return new Docket(DocumentationType.SWAGGER_2).groupName("Packet Generator and Uploader").select()
				.apis(RequestHandlerSelectors.basePackage("io.mosip.packetgenerator.controller"))
				.paths(PathSelectors.ant("/*")).build();

	}

}
