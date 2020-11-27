import { FilterModel } from './filter.model';

export class FilterRequest {
    constructor(
    public filters: FilterModel[],
    public languageCode: string,
    public optionalFilters: FilterModel[]
    ) {}
}
