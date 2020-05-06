
export class BlacklistedWordsModel {
    constructor(
        public word: string,
        public oldWord: string,
        public description: string,
        public langCode: string,        
        public isActive?: boolean,
        public id?: string,
    ) {}
}
