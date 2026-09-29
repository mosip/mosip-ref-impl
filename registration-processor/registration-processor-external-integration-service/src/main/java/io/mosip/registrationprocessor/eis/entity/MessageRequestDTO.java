package io.mosip.registrationprocessor.eis.entity;

import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * EIS POST body: MOSIP envelope plus a list of registration ids to process.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MessageRequestDTO extends BaseRestRequestDTO {

	/** Serialization version. */
	private static final long serialVersionUID = 7914304502765754692L;

	/** Registration ids (or equivalent keys) sent by external-stage. */
	private List<String> request;
}
