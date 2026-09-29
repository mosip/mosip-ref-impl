package io.mosip.registrationprocessor.externalstage.entity;

import java.util.List;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Body posted to {@code ApiName.EISERVICE}: envelope plus registration ids.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MessageRequestDTO extends BaseRestRequestDTO {

	/** Serialization version. */
	private static final long serialVersionUID = 7914304502765754692L;

	/** Registration ids forwarded to the External Integration Service. */
	private List<String> request;
}
