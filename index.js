'use strict'

const FormData = require('form-data')
const querystring = require('querystring')
const { Readable } = require('stream')

module.exports = function formMethod (json) {
  if (!json || typeof json !== 'object') {
    throw new Error('Input must be a json object')
  }
  const form = new FormData()
  const hasFile = Object.keys(json)
    .map(unfold.bind(json))
    .reduce(flatMap, [])
    .reduce((isFile, { k, v }) => {
      form.append(k, v)
      return isFile || (v && ((typeof v.pipe === 'function' && v.readable !== false) || Buffer.isBuffer(v)))
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
    payload,
    headers
  }
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
