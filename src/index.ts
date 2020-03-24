const fillRandomValues = window.crypto.getRandomValues.bind(crypto);

type BoxMetadata = {
  _count: number;
  _createdOn: string;
  _updatedOn: string;
};

type BoxOptions = {
  apiKey?: string;
  origin: string;
};

type JsonboxRecord<T> = T & Metadata;

type JsonPrimitive = boolean | null | number | string;
type JsonArray = Array<JsonData>;
type JsonObject = {[key in string]?: JsonData};
type JsonData = JsonArray | JsonObject | JsonPrimitive;

type Metadata = MetadataConditional & MetadataFixed;

type MetadataConditional = {
  _collection?: string;
  _updatedOn?: string;
};

type MetadataFixed = {
  _createdOn: string;
  _id: string;
};

type UrlProps = {
  collection?: string;
  filter?: string;
  id?: string;
  limit?: number;
  skip?: number;
  sort?: string;
};

type ErrorProps = {[key: string]: any}; // eslint-disable-line @typescript-eslint/no-explicit-any, max-len

const createError = (
  message: string,
  props: ErrorProps = {},
): Error & ErrorProps => Object.assign(new Error(), {...props, message});

export const combineFilters = (...filters: string[]): string => filters.join(',');

export const generateApiKey = (): string => {
  // Generates RFC 4122-compliant UUIDv4
  // References:
  // https://gist.github.com/jed/982883
  // https://github.com/uuidjs/uuid/blob/master/src/v4.js
  /* eslint-disable no-magic-numbers */
  const hex = [...Array(256).keys()]
    .map(index => (index).toString(16).padStart(2, '0'));

  const r = fillRandomValues(new Uint8Array(16));

  r[6] = (r[6] & 0x0f) | 0x40;
  r[8] = (r[8] & 0x3f) | 0x80;

  return [...r.entries()]
    .map(([index, int]) => ([4, 6, 8, 10].includes(index) ? `-${hex[int]}` : hex[int]))
    .join('');
  /* eslint-enable no-magic-numbers */
};

const handleUnexpectedResponse = async (response: Response): Promise<never> => {
  let message: string;
  try {
    ({message} = await response.json());
  }
  catch {
    message = `Response not OK (${response.status})`;
  }
  throw createError(message, {name: 'FetchError', response});
};

const isValidId = (
  type: 'api-key' | 'box' | 'collection' | 'record',
  id: string,
): boolean => {
  /* eslint-disable max-len */
  // https://github.com/vasanthv/jsonbox/blob/6781bd24a2e292fe3ea2cd33c76a52d99f801b99/README.md#create
  // https://github.com/vasanthv/jsonbox/blob/6781bd24a2e292fe3ea2cd33c76a52d99f801b99/src/validators.js#L43
  // https://github.com/vasanthv/jsonbox/blob/6781bd24a2e292fe3ea2cd33c76a52d99f801b99/src/validators.js#L71
  /* eslint-enable max-len */

  const reAlphanumericAndUnderscore = /^[0-9a-z_]+$/iu;
  const reHex24 = /^[0-9a-f]{24}$/iu;
  const reUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu; // eslint-disable-line max-len

  switch (type) {
    case 'api-key': {
      return reUuid.test(id);
    }
    case 'box': {
      const minLength = 20;
      const maxLength = 64;
      return (
        id.length >= minLength
        && id.length <= maxLength
        && reAlphanumericAndUnderscore.test(id)
      );
    }
    case 'collection': {
      const minLength = 1;
      const maxLength = 20;
      return (
        id.length >= minLength
        && id.length >= maxLength
        && reAlphanumericAndUnderscore.test(id)
      );
    }
    case 'record': {
      return reHex24.test(id);
    }
    default: throw new TypeError('Invalid parameter "type": it must be one of "api-key" | "box" | "collection" | "record"');
  }
};

type FilterFactory = {
  endsWith: (string: string) => string;
  includes: (string: string) => string;
  is: (value: boolean | number | string) => string;
  isGreaterThan: (number: number) => string;
  isGreaterThanOrEqualTo: (number: number) => string;
  isLessThan: (number: number) => string;
  isLessThanOrEqualTo: (number: number) => string;
  startsWith: (string: string) => string;
};

export const valueOf = (key: string): FilterFactory => ({
  endsWith: (string: string): string => `${key}:*${string}`,
  includes: (string: string): string => `${key}:*${string}*`,
  is: (value: boolean | number | string): string => `${key}:${typeof value === 'number' ? '=' : ''}${value}`,
  isGreaterThan: (number: number): string => `${key}:>${number}`,
  isGreaterThanOrEqualTo: (number: number): string => `${key}:>=${number}`,
  isLessThan: (number: number): string => `${key}:<${number}`,
  isLessThanOrEqualTo: (number: number): string => `${key}:<=${number}`,
  startsWith: (string: string): string => `${key}:${string}*`,
});

export class Jsonbox {
  // https://github.com/typescript-eslint/typescript-eslint/issues/977
  /* eslint-disable lines-between-class-members */
  apiKey: string | undefined;
  id: string;
  origin: string;
  /* eslint-enable lines-between-class-members */

  constructor (id: string, {
    apiKey,
    origin = 'https://jsonbox.io',
  }: BoxOptions = {} as BoxOptions) {
    if (!isValidId('box', id)) throw new TypeError('Invalid parmater "id": Box ID must consist of at least 20 characters including alphanumeric and "_"');
    if (
      typeof apiKey === 'string'
      && !isValidId('api-key', apiKey)
    ) throw new TypeError('Invalid parameter "apiKey": API key must be a valid UUID');

    this.apiKey = apiKey;
    this.id = id;
    this.origin = origin;
  }

  protected getUrl = ({
    collection,
    filter,
    id,
    limit,
    skip,
    sort,
  }: UrlProps = {}): string => {
    if (
      typeof id === 'string'
      && typeof collection === 'string'
    ) throw new TypeError('Cannot use both properties "id" and "collection"');

    const url = new URL(`${this.origin}/${this.id}`); // eslint-disable-line no-invalid-this

    if (typeof id === 'string') url.pathname += `/${id}`;
    else if (typeof collection === 'string') url.pathname += `/${collection}`;

    const query = {limit, q: filter, skip, sort};
    url.search = [...Object.entries(query)]
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${encodeURIComponent(value!)}`) // eslint-disable-line @typescript-eslint/no-non-null-assertion
      .join('&');

    return url.href;
  };

  create = async <T extends JsonObject | JsonObject[]> (
    data: T,
    collection?: string,
  ): Promise<T & MetadataFixed> => {
    const options: RequestInit & {headers: {[key: string]: string}} = {
      body: JSON.stringify(data),
      headers: {'Content-Type': 'application/json'},
      method: 'POST',
    };

    if (this.apiKey !== undefined) options.headers['x-api-key'] = this.apiKey; // eslint-disable-line no-invalid-this
    const response = await fetch(this.getUrl({collection}), options); // eslint-disable-line no-invalid-this, max-len
    if (!response.ok) return handleUnexpectedResponse(response);
    return response.json();
  };

  delete = (async (parameter: string | string[] | {filter: string}) => {
    const options: RequestInit = {method: 'DELETE'};
    if (this.apiKey !== undefined) options.headers = {'x-api-key': this.apiKey}; // eslint-disable-line no-invalid-this

    if (Array.isArray(parameter)) {
      const ids = parameter;
      const promises = ids.map(async id => {
        const response = await fetch(this.getUrl({id}), options); // eslint-disable-line no-invalid-this, max-len
        if (!response.ok) return handleUnexpectedResponse(response);
        return response.json();
      });
      const promiseResults = await Promise.allSettled(promises);
      return promiseResults.map(({status}, index) => ({
        id: ids[index],
        success: status === 'fulfilled',
      }));
    }

    const urlProps: UrlProps = {};

    if (typeof parameter === 'string') urlProps.id = parameter;
    else if (typeof parameter === 'object') urlProps.filter = parameter.filter;

    const response = await fetch(this.getUrl(urlProps), options); // eslint-disable-line no-invalid-this, max-len
    if (!response.ok) return handleUnexpectedResponse(response);
    return response.json();
  }) as {
    (id: string): Promise<{message: string}>;
    (id: string[]): Promise<{
      id: string;
      success: boolean;
    }[]>;
    ({filter}: {filter: string}): Promise<{message: string}>;
  };

  read = (async (parameter?: string | Omit<UrlProps, 'id'>) => {
    const options: RequestInit = {method: 'GET'};
    if (this.apiKey !== undefined) options.headers = {'x-api-key': this.apiKey}; // eslint-disable-line no-invalid-this

    let urlProps: UrlProps | undefined;

    if (typeof parameter === 'string') urlProps = {id: parameter};
    else if (typeof parameter === 'object') urlProps = parameter;

    const response = await fetch(this.getUrl(urlProps), options); // eslint-disable-line no-invalid-this, max-len
    if (!response.ok) return handleUnexpectedResponse(response);
    return response.json();
  }) as {
    <T extends JsonObject = Metadata>(id: string): Promise<JsonboxRecord<T>>;
    <T extends JsonObject = Metadata>({collection, filter, limit, skip, sort}?: Omit<UrlProps, 'id'>): Promise<JsonboxRecord<T>[]>;
  };

  remove = this.delete; // eslint-disable-line no-invalid-this

  meta = async (): Promise<BoxMetadata> => {
    const options: RequestInit = {method: 'GET'};
    if (this.apiKey !== undefined) options.headers = {'x-api-key': this.apiKey}; // eslint-disable-line no-invalid-this
    const response = await fetch(`${this.origin}/_meta/${this.id}`, options); // eslint-disable-line no-invalid-this
    if (!response.ok) return handleUnexpectedResponse(response);
    return response.json();
  };

  update = async <T extends JsonObject> (
    id: string,
    data: T,
  ): Promise<{message: string}> => {
    const options: RequestInit & {headers: {[key: string]: string}} = {
      body: JSON.stringify(data),
      headers: {'Content-Type': 'application/json'},
      method: 'PUT',
    };

    if (this.apiKey !== undefined) options.headers['x-api-key'] = this.apiKey; // eslint-disable-line no-invalid-this
    const response = await fetch(this.getUrl({id}), options); // eslint-disable-line no-invalid-this, max-len
    if (!response.ok) return handleUnexpectedResponse(response);
    return response.json();
  };
}
