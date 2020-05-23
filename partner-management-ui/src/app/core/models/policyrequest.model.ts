export class PolicyUpdateRequest {
    constructor(
        public oldPolicyID: string,
        public newPolicyID: string
    ) {}
}
