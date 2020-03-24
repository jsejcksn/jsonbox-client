declare type BoxMetadata = {
    _count: number;
    _createdOn: string;
    _updatedOn: string;
};
declare type InstanceOptions = {
    apiKey?: string;
    origin: string;
};
declare type JsonboxRecord<T> = T & Metadata;
declare type JsonPrimitive = boolean | null | number | string;
declare type JsonArray = Array<JsonData>;
declare type JsonObject = {
    [key in string]?: JsonData;
};
declare type JsonData = JsonArray | JsonObject | JsonPrimitive;
declare type Metadata = MetadataConditional & MetadataFixed;
declare type MetadataConditional = {
    _collection?: string;
    _updatedOn?: string;
};
declare type MetadataFixed = {
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
    create: <T extends JsonObject | JsonObject[]>(data: T, collection?: string | undefined) => Promise<T & MetadataFixed>;
    delete: {
        (id: string): Promise<{
            message: string;
        }>;
        (id: string[]): Promise<{
            id: string;
            success: boolean;
        }[]>;
        ({ filter }: {
            filter: string;
        }): Promise<{
            message: string;
        }>;
    };
    read: {
        <T extends JsonObject = Metadata>(id: string): Promise<JsonboxRecord<T>>;
        <T_1 extends JsonObject = Metadata>({ collection, filter, limit, skip, sort }?: Pick<UrlProps, "filter" | "collection" | "limit" | "skip" | "sort"> | undefined): Promise<JsonboxRecord<T_1>[]>;
    };
    remove: {
        (id: string): Promise<{
            message: string;
        }>;
        (id: string[]): Promise<{
            id: string;
            success: boolean;
        }[]>;
        ({ filter }: {
            filter: string;
        }): Promise<{
            message: string;
        }>;
    };
    meta: () => Promise<BoxMetadata>;
    update: <T extends JsonObject>(id: string, data: T) => Promise<{
        message: string;
    }>;
}
export {};
