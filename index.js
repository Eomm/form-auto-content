'use strict'

const FormData = require('form-data')
const querystring = require('querystring')

module.exports = function formMethod (json) {
  if (!json || typeof json !== 'object') {
    throw new Error('Input to form-method must be a json object')
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
  const header = { 'content-type': null }
  if (hasFile) {
    payload = form
    Object.assign(header, form.getHeaders())
  } else {
    payload = querystring.stringify(json)
    header['content-type'] = 'application/x-www-form-urlencoded'
  }

  return {
    getPayload () { return payload },
    getHeaders () { return header }
  }
}

function unfold (k) {
  const v = this[k]
  if (Array.isArray(v)) {
    return v.map(subVal => { return { k, v: subVal } })
  }
  return { k, v }
}

function flatMap (acc, unfold) {
  if (Array.isArray(unfold)) {
    return acc.concat(unfold)
  }
  acc.push(unfold)
  return acc
}
