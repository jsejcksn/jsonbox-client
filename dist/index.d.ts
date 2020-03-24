declare type BoxMetadata = {
    _count: number;
    _createdOn: string;
    _updatedOn: string;
};
declare type Delete = {
    (id: string): Promise<{
        message: string;
    }>;
    (id: string[]): Promise<{
        deleted: boolean;
        id: string;
    }[]>;
    ({ filter }: {
        filter: string;
    }): Promise<{
        message: string;
    }>;
};
declare type InstanceOptions = {
    apiKey?: string;
    origin: string;
};
declare type JsonPrimitive = boolean | null | number | string;
declare type JsonArray = Array<JsonData>;
declare type JsonObject = {
    [key: string]: JsonData;
};
declare type JsonData = JsonArray | JsonObject | JsonPrimitive;
declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
declare type Read = {
    <T extends JsonObject>(id?: string): Promise<Record<T>>;
    <T extends JsonObject>({ collection, filter, limit, skip, sort }?: Omit<UrlProps, 'id'>): Promise<Record<T>[]>;
};
declare type Record<T> = T & RecordMetadata;
declare type RecordMetadata = RecordMetadataFixed & RecordMetadataConditional;
declare type RecordMetadataConditional = {
    _collection?: string;
    _updatedOn?: string;
};
declare type RecordMetadataFixed = {
    _createdOn: string;
    _id: string;
};
declare type UrlProps = {
    collection?: string;
    filter?: string;
    id?: string;
    limit?: number;
    skip?: number;
    sort?: string;
};
export declare const combineFilters: (...filters: string[]) => string;
export declare const generateApiKey: () => string;
declare type FilterFactory = {
    endsWith: (string: string) => string;
    includes: (string: string) => string;
    is: (value: boolean | number | string) => string;
    isGreaterThan: (number: number) => string;
    isGreaterThanOrEqualTo: (number: number) => string;
    isLessThan: (number: number) => string;
    isLessThanOrEqualTo: (number: number) => string;
    startsWith: (string: string) => string;
};
export declare const valueOf: (key: string) => FilterFactory;
export declare class Jsonbox {
    apiKey: string | undefined;
    id: string;
    origin: string;
    constructor(id: string, { apiKey, origin, }?: InstanceOptions);
    protected getUrl: ({ collection, filter, id, limit, skip, sort, }?: UrlProps) => string;
    create: <T extends JsonObject | JsonObject[]>(data: T, collection?: string | undefined) => Promise<T & RecordMetadataFixed>;
    delete: Delete;
    read: Read;
    remove: Delete;
    meta: () => Promise<BoxMetadata>;
    update: <T extends JsonObject>(id: string, data: T) => Promise<{
        message: string;
    }>;
}
export {};
