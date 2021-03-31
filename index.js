'use strict'

const FormData = require('form-data')
const querystring = require('querystring')
const { Readable } = require('stream')

module.exports = function formMethod (json, opts) {
  if (!json || typeof json !== 'object') {
    throw new Error('Input must be a json object')
  }

  const options = Object.assign({}, { payload: 'payload', headers: 'headers' }, opts)

  const form = new FormData()
  const hasFile = Object.keys(json)
    .map(unfold.bind(json))
    .reduce(flatMap, [])
    .reduce((isFile, { k, v }) => {
      const value = getValue(v)
      const options = getOptions(v)
      form.append(k, value, options)

      return isFile || (value && (
        (typeof value.pipe === 'function' && value.readable !== false) ||
        Buffer.isBuffer(value)))
    }, false)

  let payload
  const headers = { 'content-type': null }
  if (hasFile) {
    payload = form
    Object.assign(headers, form.getHeaders())
  } else {
    payload = Readable.from(querystring.stringify(json))
    headers['content-type'] = 'application/x-www-form-urlencoded'
  }

  return {
    [options.payload]: payload,
    [options.headers]: headers
  }
}

function getValue (o) { return getField(o, 'value') || o }
function getOptions (o) { return getField(o, 'options') }

function getField (o, field) {
  if (typeof o === 'object' &&
   Object.hasOwnProperty.call(o, field)) {
    return o[field]
  }
  return undefined
}

function unfold (k) {
  const v = this[k]
  if (Array.isArray(v)) {
    return v.map(subVal => { return { k, v: subVal } })
  }
  return { k, v }
}

// We need to support node 10 till April 2021
function flatMap (acc, unfold) {
  if (Array.isArray(unfold)) {
    return acc.concat(unfold)
  }
  acc.push(unfold)
  return acc
}
