# jsonbox-client

This is an isomorphic JavaScript module which includes all of the tools you need to help you interact with a [jsonbox](https://github.com/vasanthv/jsonbox) server (like [jsonbox.io](https://jsonbox.io/)). It has first-class TypeScript support.


  - [Install](#install)
  - [Use](#use)
    - [Import](#import)
      - [`import` (ES modules)](#import-es-modules)
      - [`require` (CommonJS)](#require-commonjs)
    - [Imports](#imports)
      - [`Jsonbox`](#jsonbox)
        - [`create`](#create)
        - [`update`](#update)
        - [`read`](#read)
        - [`remove` / `delete`](#remove--delete)
        - [`meta`](#meta)
      - [`combineFilters` and `valueOf`](#combinefilters-and-valueof)
        - [`valueOf` methods](#valueof-methods)
      - [`generateApiKey`](#generateapikey)


## Install

```sh
npm install jsonbox-client
```


## Use


### Import

> Your module specifier depeonds on your environment.
>
> If in a Node.js module: a bare specifier works.
>
> If in a browser module: you'll need to use a path to the module file. If you've installed via `npm`, it would be a local path like `./node_modules/jsonbox-client/dist/index.js`. Or maybe you're using a network path to an NPM-aware CDN like `https://unpkg.com/jsonbox-client`.
>
> Some specifier examples are included below:

#### `import` (ES modules)

> Environments: browser, Node.js >= 13.x.x [using ES modules](https://nodejs.org/docs/latest-v13.x/api/esm.html#esm_package_json_type_field)

```ts
import {
  Jsonbox,
  combineFilters,
  generateApiKey,
  valueOf,
} from 'YOUR_SPECIFIER_GOES_HERE';
```

Specifier examples:

  - Browser (local): `./node_modules/jsonbox-client/dist/index.js`
  - Browser (CDN): `https://unpkg.com/jsonbox-client`
  - Node: `jsonbox-client`

#### `require` (CommonJS)

> Environments: Node.js >=12.x.x using CommonJS modules

```ts
const {
  Jsonbox,
  combineFilters,
  generateApiKey,
  valueOf,
} = require('YOUR_SPECIFIER_GOES_HERE');
```

Specifier examples:

  - Node >13.x.x: `jsonbox-client`

  - Node 12.x.x: `jsonbox-client/commonjs`


### Imports

#### `Jsonbox`

This is the main import. It helps you to send and receive data from your jsonbox server. To get started, pass your configuration options to create a new `Jsonbox` instance:

```ts
import {Jsonbox} from 'jsonbox-client`;
```

```ts
// at minimum, you must provide a boxId

const boxId = 'box_2c846c501950dab86062';
const jsonbox = new Jsonbox(boxId);
```
```ts
// you can also provide some options

const boxOptions = {
  apiKey: 'b8ceca96-ebb8-4a2a-9a21-758c12ca6b54', // only used with protected boxes
  origin: 'https://jsonbox.io', // this is the default, but you could also connect to a different jsonbox server
};

const jsonbox = new Jsonbox(boxId, boxOptions);
```
```ts
// you can also change the values later

jsonbox.id = 'a_different_box_id';
jsonbox.apiKey = 'c8ceca96-ebb8-4a2a-9a21-758c12ca6b54';
jsonbox.origin = 'https://jsonbox.mydomain.com';
```

`Jsonbox` methods

These are all async. There is also `jsonbox.delete`, which is the same as `jsonbox.remove`, but can't be destructured because the global `delete` keyword already exists.

```ts
const {create, meta, read, remove, update} = jsonbox;
```

##### `create`

Create one or more records (objects) in a jsonbox (an array of objects)

```ts
const {create} = jsonbox;
```

Create a single record

```ts
const person = {name: 'Jacob'};
const result = await create(person);
```
```js
// result

{
  _id: '5e7ac65299ed160017dc2c81',
  name: 'Jacob',
  _createdOn: '2020-03-25T02:47:46.525Z'
}
```

Create a single record in a collection

```ts
const wizard = {name: 'Harry', house: 'Gryffindor', born: 1980};
const collection = 'wizards';
const result = await create(wizard, collection);
```
```js
// result

{
  _id: '5e7ac67499ed160017dc2c82',
  name: 'Harry',
  house: 'Gryffindor',
  born: 1980,
  _createdOn: '2020-03-25T02:48:20.278Z'
}
```

Create multiple records at once in a collection

```ts
const wizards = [
  {name: 'Ron', house: 'Gryffindor', born: 1980},
  {name: 'Draco', house: 'Slytherin', born: 1980},
  {name: 'Cedric', house: 'Hufflepuff', born: 1977},
];
const collection = 'wizards';
const result = await create(wizards, collection);
```
```js
// result

[
  {
    _id: '5e7ac69799ed160017dc2c83',
    name: 'Ron',
    house: 'Gryffindor',
    born: 1980,
    _createdOn: '2020-03-25T02:48:55.777Z'
  },
  {
    _id: '5e7ac69799ed160017dc2c84',
    name: 'Draco',
    house: 'Slytherin',
    born: 1980,
    _createdOn: '2020-03-25T02:48:55.778Z'
  },
  {
    _id: '5e7ac69799ed160017dc2c85',
    name: 'Cedric',
    house: 'Hufflepuff',
    born: 1977,
    _createdOn: '2020-03-25T02:48:55.778Z'
  }
]
```

##### `update`

Update a record

```ts
const {update} = jsonbox;

const id = '5e7ac69799ed160017dc2c85';
const updatedWizard = {name: 'Cedric', house: 'Hufflepuff', born: 1977, died: 1995};
const result = await update(id, updatedWizard);
```
```js
// result

{ message: 'Record updated.' }
```

##### `read`

Read one or more records

```ts
const {read} = jsonbox;
```

Read a single record by its ID

```ts
const id = '5e7ac69799ed160017dc2c83';
const result = await read(id);
```
```js
// result

{
  _id: '5e7ac69799ed160017dc2c83',
  name: 'Ron',
  house: 'Gryffindor',
  born: 1980,
  _createdOn: '2020-03-25T02:48:55.777Z',
  _collection: 'wizards'
}
```

Read all records

```ts
const result = await read();
```
```js
// result

[
  {
    _id: '5e7ac69799ed160017dc2c84',
    name: 'Draco',
    house: 'Slytherin',
    born: 1980,
    _createdOn: '2020-03-25T02:48:55.778Z',
    _collection: 'wizards'
  },
  {
    _id: '5e7ac69799ed160017dc2c85',
    name: 'Cedric',
    house: 'Hufflepuff',
    born: 1977,
    died: 1995,
    _createdOn: '2020-03-25T02:48:55.778Z',
    _updatedOn: '2020-03-25T03:01:59.698Z',
    _collection: 'wizards'
  },
  {
    _id: '5e7ac69799ed160017dc2c83',
    name: 'Ron',
    house: 'Gryffindor',
    born: 1980,
    _createdOn: '2020-03-25T02:48:55.777Z',
    _collection: 'wizards'
  },
  {
    _id: '5e7ac67499ed160017dc2c82',
    name: 'Harry',
    house: 'Gryffindor',
    born: 1980,
    _createdOn: '2020-03-25T02:48:20.278Z',
    _collection: 'wizards'
  },
  {
    _id: '5e7ac65299ed160017dc2c81',
    name: 'Jacob',
    _createdOn: '2020-03-25T02:47:46.525Z'
  }
]
```

Read all records in a collection

```ts
const readOptions = {collection: 'wizards'};
const result = await read(readOptions);
```
```js
// result

[
  {
    _id: '5e7ac69799ed160017dc2c84',
    name: 'Draco',
    house: 'Slytherin',
    born: 1980,
    _createdOn: '2020-03-25T02:48:55.778Z'
  },
  {
    _id: '5e7ac69799ed160017dc2c85',
    name: 'Cedric',
    house: 'Hufflepuff',
    born: 1977,
    died: 1995,
    _createdOn: '2020-03-25T02:48:55.778Z',
    _updatedOn: '2020-03-25T03:01:59.698Z'
  },
  {
    _id: '5e7ac69799ed160017dc2c83',
    name: 'Ron',
    house: 'Gryffindor',
    born: 1980,
    _createdOn: '2020-03-25T02:48:55.777Z'
  },
  {
    _id: '5e7ac67499ed160017dc2c82',
    name: 'Harry',
    house: 'Gryffindor',
    born: 1980,
    _createdOn: '2020-03-25T02:48:20.278Z'
  }
]
```

Limited number of records

```ts
const readOptions = {limit: 2};
const result = await read(readOptions);
```
```js
// result

[
  {
    _id: '5e7ac69799ed160017dc2c84',
    name: 'Draco',
    house: 'Slytherin',
    born: 1980,
    _createdOn: '2020-03-25T02:48:55.778Z',
    _collection: 'wizards'
  },
  {
    _id: '5e7ac69799ed160017dc2c85',
    name: 'Cedric',
    house: 'Hufflepuff',
    born: 1977,
    died: 1995,
    _createdOn: '2020-03-25T02:48:55.778Z',
    _updatedOn: '2020-03-25T03:01:59.698Z',
    _collection: 'wizards'
  }
]
```

Skip some records

```ts
const readOptions = {skip: 2};
const result = await read(readOptions);
```
```js
// result

[
  {
    _id: '5e7ac69799ed160017dc2c83',
    name: 'Ron',
    house: 'Gryffindor',
    born: 1980,
    _createdOn: '2020-03-25T02:48:55.777Z',
    _collection: 'wizards'
  },
  {
    _id: '5e7ac67499ed160017dc2c82',
    name: 'Harry',
    house: 'Gryffindor',
    born: 1980,
    _createdOn: '2020-03-25T02:48:20.278Z',
    _collection: 'wizards'
  },
  {
    _id: '5e7ac65299ed160017dc2c81',
    name: 'Jacob',
    _createdOn: '2020-03-25T02:47:46.525Z'
  }
]
```

Sort records by field

```ts
const readOptions = {sort: 'house'};
const result = await read(readOptions);
```
```js
// result

[
  {
    _id: '5e7ac65299ed160017dc2c81',
    name: 'Jacob',
    _createdOn: '2020-03-25T02:47:46.525Z'
  },
  {
    _id: '5e7ac67499ed160017dc2c82',
    name: 'Harry',
    house: 'Gryffindor',
    born: 1980,
    _createdOn: '2020-03-25T02:48:20.278Z',
    _collection: 'wizards'
  },
  {
    _id: '5e7ac69799ed160017dc2c83',
    name: 'Ron',
    house: 'Gryffindor',
    born: 1980,
    _createdOn: '2020-03-25T02:48:55.777Z',
    _collection: 'wizards'
  },
  {
    _id: '5e7ac69799ed160017dc2c85',
    name: 'Cedric',
    house: 'Hufflepuff',
    born: 1977,
    died: 1995,
    _createdOn: '2020-03-25T02:48:55.778Z',
    _updatedOn: '2020-03-25T03:01:59.698Z',
    _collection: 'wizards'
  },
  {
    _id: '5e7ac69799ed160017dc2c84',
    name: 'Draco',
    house: 'Slytherin',
    born: 1980,
    _createdOn: '2020-03-25T02:48:55.778Z',
    _collection: 'wizards'
  }
]
```

Filter records by value(s)

(See [jsonbox#filtering](https://github.com/vasanthv/jsonbox#filtering) for syntax details). For easier filter matching, use the provided imports [`combineFilters` and `valueOf`](#combinefilters-and-valueof).

```ts
const readOptions = {filter: 'born:=1980,name:*a*'};
const result = await read(readOptions);
```
```js
// result

[
  {
    _id: '5e7ac69799ed160017dc2c84',
    name: 'Draco',
    house: 'Slytherin',
    born: 1980,
    _createdOn: '2020-03-25T02:48:55.778Z',
    _collection: 'wizards'
  },
  {
    _id: '5e7ac67499ed160017dc2c82',
    name: 'Harry',
    house: 'Gryffindor',
    born: 1980,
    _createdOn: '2020-03-25T02:48:20.278Z',
    _collection: 'wizards'
  }
]
```

Combine read options

```ts
const readOptions = {filter: 'house:Gryffindor', sort: 'name'};
const result = await read(readOptions);
```
```js
// result

[
  {
    _id: '5e7ac67499ed160017dc2c82',
    name: 'Harry',
    house: 'Gryffindor',
    born: 1980,
    _createdOn: '2020-03-25T02:48:20.278Z',
    _collection: 'wizards'
  },
  {
    _id: '5e7ac69799ed160017dc2c83',
    name: 'Ron',
    house: 'Gryffindor',
    born: 1980,
    _createdOn: '2020-03-25T02:48:55.777Z',
    _collection: 'wizards'
  }
]
```

##### `remove` / `delete`

Delete one or more records

```ts
const {remove} = jsonbox; // also: jsonbox.delete
```

Delete a single record by its ID

```ts
const id = '5e7ac69799ed160017dc2c85';
const result = await remove(id);
```
```js
// result

{ message: 'Record removed.' }
```

Delete multiple records by their IDs

This actually makes multiple concurrent delete requests using `Promise.allSettled` and returns the mapped results in an array.

```ts
const ids = [
  '5e7ac65299ed160017dc2c81',
  '5e7ac69799ed160017dc2c84',
];
const result = await remove(ids);
```
```js
// result

[
  { id: '5e7ac65299ed160017dc2c81', success: true },
  { id: '5e7ac69799ed160017dc2c84', success: true }
]
```

Delete one or more records using a filter

```ts
const deleteOptions = {filter: 'house:Gryffindor'};
const result = await remove(deleteOptions);
```
```js
// result

{ message: '2 Records removed.' }
```

##### `meta`

Read the metadata for your box

```ts
const {meta} = jsonbox;

const result = await meta();
```
```js
// result

{
  _count: 5,
  _createdOn: '2020-03-25T02:47:46.525Z',
  _updatedOn: '2020-03-25T03:01:59.698Z'
}
```

#### `combineFilters` and `valueOf`

These are functions to help you compose filters using natural language instead of having to remember the [jsonbox-specific syntax](https://github.com/vasanthv/jsonbox#filtering).

```ts
import {combineFilters, valueOf} from 'jsonbox-client`;
```
```ts
// single filter

const filter = valueOf('house').is('Gryffindor');

filter === 'house:Gryffindor'; // true
```
```ts
// multiple filters

const filter = combineFilters(
  valueOf('house').endsWith('in'),
  valueOf('name').includes('a'),
  valueOf('born').isGreaterThanOrEqualTo(1980),
);

filter === 'house:*in,name:*a*,born:>=1980'; // true

const readOptions = {filter};
const results = await read(readOptions);
```
```js
[
  {
    _id: '5e7ac69799ed160017dc2c84',
    name: 'Draco',
    house: 'Slytherin',
    born: 1980,
    _createdOn: '2020-03-25T02:48:55.778Z',
    _collection: 'wizards'
  }
]
```

##### `valueOf` methods:

  - `endsWith`: string
  - `includes`: string
  - `is`: boolean | number | string
  - `isGreaterThan`: number
  - `isGreaterThanOrEqualTo`: number
  - `isLessThan`: number
  - `isLessThanOrEqualTo`: number
  - `startsWith`: string

#### `generateApiKey`

When using an API key, jsonbox requires it to be a valid UUID. This function generates a randomized, RFC 4122-compliant version-4 UUID.

```ts
import {generateApiKey} from 'jsonbox-client';

generateApiKey(): // random UUID in the format 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
```

```ts
```

```ts
```

```ts
```
