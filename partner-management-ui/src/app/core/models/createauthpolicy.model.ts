import { AuthPolicies } from './authpolicies.model';
import { AllowedKycAttributes } from './allowedkycattributes.model';

export class CreateAuthPolicy {
    constructor(
        public name: string,
        public descr: string,
        public authPolicies: AuthPolicies[],
        public allowedKycAttributes: AllowedKycAttributes[]
    ) {}
}
