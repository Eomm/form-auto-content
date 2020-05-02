# form-auto-content

[![Build Status](https://github.com/Eomm/form-auto-content/workflows/ci/badge.svg)](https://github.com/Eomm/form-auto-content/actions)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


Build a form payload without caring if it should be `application/x-www-form-urlencoded` or `multipart/form-data`

## Install

```
npm install form-auto-content
```

## Usage

This module will transform your JSON to a payload ready to submit to an HTTP server!
The autosense feature will check if there is a `stream` or a `buffer` as input and it will act accordingly returning a `multipart/form-data` stream; otherwise it will create a `x-www-form-urlencoded` string.

The module return a JSON like this:

```js
{
  payload: Stream, // the data Stream
  headers: {} // a JSON with the `content-type` field set
}
```

### `x-www-form-urlencoded`

```js
const formAutoContent = require('form-auto-content')

const myForm = formAutoContent({
  field1: 'value1',
  field2: ['value2', 'value2.2'] // array are supported too!!
})

myForm.payload // Stream of the string in application/x-www-form-urlencoded format
myForm.headers // JSON with the `content-type` field set
```

### `multipart/form-data`

```js
const formAutoContent = require('form-auto-content')

const myForm = formAutoContent({
  field1: 'value1',
  field2: ['value2', 'value2.2'], // array are supported too!!
  myFile: fs.createReadStream('the-file.xml'),
  multipleFiles: [fs.createReadStream('file1.xml'), fs.createReadStream('file2.xml')],
  wowBuffer: Buffer.from('a long string')
})

myForm.payload // Stream in multipart/form-data format
myForm.headers // JSON with the `content-type` field set to multipart/form-data
```


## License

Licensed under [MIT](./LICENSE).
