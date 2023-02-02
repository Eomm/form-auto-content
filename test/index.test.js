'use strict'

const { test } = require('tap')
const formMethod = require('../index')
const fs = require('fs')
const inject = require('light-my-request')
const multiparty = require('multiparty')

test('bad input', t => {
  t.plan(4)

  t.throws(() => formMethod())
  t.throws(() => formMethod(null))
  t.throws(() => formMethod('string'))
  t.throws(() => formMethod(true))
})

test('application/x-www-form-urlencoded', t => {
  t.plan(2)
  const form = formMethod({
    field1: 'value1',
    field2: 'value2'
  })

  let payload = ''
  form.payload.on('data', data => { payload += data })
  form.payload.on('end', () => {
    t.strictSame(payload, 'field1=value1&field2=value2')
  })
  t.strictSame(form.headers, { 'content-type': 'application/x-www-form-urlencoded' })
})

test('custom data name', t => {
  t.plan(2)
  const form = formMethod({
    field1: 'value1',
    field2: 'value2'
  }, { payload: 'body', headers: 'head' })

  let payload = ''
  form.body.on('data', data => { payload += data })
  form.body.on('end', () => {
    t.strictSame(payload, 'field1=value1&field2=value2')
  })
  t.strictSame(form.head, { 'content-type': 'application/x-www-form-urlencoded' })
})

test('application/x-www-form-urlencoded array', t => {
  t.plan(2)
  const form = formMethod({
    field1: ['value1', 'value3'],
    field2: 'value2'
  })

  let payload = ''
  form.payload.on('data', data => { payload += data })
  form.payload.on('end', () => {
    t.strictSame(payload, 'field1=value1&field1=value3&field2=value2')
  })
  t.strictSame(form.headers, { 'content-type': 'application/x-www-form-urlencoded' })
})

test('multipart/form-data', t => {
  t.plan(8)
  const form = formMethod({
    field1: ['👌', 'value1'],
    field2: fs.createReadStream('./LICENSE'),
    field3: 'true'
  })
  t.ok(form.headers['content-type'].startsWith('multipart/form-data;'))

  const dispatch = function (req, res) {
    const form = new multiparty.Form()
    form.parse(req, function (err, fields, files) {
      t.error(err)
      t.equal(fields.field1[0], '👌')
      t.equal(fields.field1[1], 'value1')
      t.equal(files.field2[0].originalFilename, 'LICENSE')
      t.equal(fields.field3[0], 'true')
      res.writeHead(200, { 'content-type': req.headers['content-type'] })
      res.end('')
    })
  }

  inject(dispatch, {
    method: 'POST',
    url: '/',
    payload: form.payload,
    headers: form.headers
  }, (err, res) => {
    t.error(err)
    t.ok(res.headers['content-type'].startsWith('multipart/form-data;'))
  })
})

test('multipart/form-data multiple file', t => {
  t.plan(7)
  const form = formMethod({
    field1: [fs.createReadStream('./LICENSE'), fs.createReadStream('./LICENSE'), 'a string']
  })
  t.ok(form.headers['content-type'].startsWith('multipart/form-data;'))

  const dispatch = function (req, res) {
    const form = new multiparty.Form()
    form.parse(req, function (err, fields, files) {
      t.error(err)
      t.equal(fields.field1[0], 'a string')
      t.equal(files.field1[0].originalFilename, 'LICENSE')
      t.equal(files.field1[1].originalFilename, 'LICENSE')
      res.writeHead(200, { 'content-type': req.headers['content-type'] })
      res.end('')
    })
  }

  inject(dispatch, {
    method: 'POST',
    url: '/',
    payload: form.payload,
    headers: form.headers
  }, (err, res) => {
    t.error(err)
    t.ok(res.headers['content-type'].startsWith('multipart/form-data;'))
  })
})

test('multipart/form-data with options', t => {
  t.plan(12)
  const form = formMethod({
    field1: ['👌', 'value1'],
    field2: {
      value: fs.createReadStream('./LICENSE'),
      options: {
        filename: 'bar.md',
        contentType: 'text/markdown'
      }
    },
    field3: 'true',
    field4: [fs.createReadStream('./LICENSE'), {
      value: fs.createReadStream('./LICENSE'),
      options: { filename: 'suboption-in-array.md' }
    }, 'a string']
  })
  t.ok(form.headers['content-type'].startsWith('multipart/form-data;'))

  const dispatch = function (req, res) {
    const form = new multiparty.Form()
    form.parse(req, function (err, fields, files) {
      t.error(err)
      t.equal(fields.field1[0], '👌')
      t.equal(fields.field1[1], 'value1')
      t.equal(fields.field4[0], 'a string')
      t.equal(files.field2[0].originalFilename, 'bar.md')
      t.equal(fs.readFileSync(files.field2[0].path, 'utf-8'), fs.readFileSync('./LICENSE', 'utf-8'))
      t.equal(fields.field3[0], 'true')
      t.equal(files.field4[0].originalFilename, 'LICENSE')
      t.equal(files.field4[1].originalFilename, 'suboption-in-array.md')
      res.writeHead(200, { 'content-type': req.headers['content-type'] })
      res.end('')
    })
  }

  inject(dispatch, {
    method: 'POST',
    url: '/',
    payload: form.payload,
    headers: form.headers
  }, (err, res) => {
    t.error(err)
    t.ok(res.headers['content-type'].startsWith('multipart/form-data;'))
  })
})

test('multipart/form-data with no files', t => {
  t.plan(7)
  const form = formMethod({
    field1: ['👌', 'value1'],
    field2: 'true'
  }, { forceMultiPart: true })
  t.ok(form.headers['content-type'].startsWith('multipart/form-data;'))

  const dispatch = function (req, res) {
    const form = new multiparty.Form()
    form.parse(req, function (err, fields, files) {
      t.error(err)
      t.equal(fields.field1[0], '👌')
      t.equal(fields.field1[1], 'value1')
      t.equal(fields.field2[0], 'true')
      res.writeHead(200, { 'content-type': req.headers['content-type'] })
      res.end('')
    })
  }

  inject(dispatch, {
    method: 'POST',
    url: '/',
    payload: form.payload,
    headers: form.headers
  }, (err, res) => {
    t.error(err)
    t.ok(res.headers['content-type'].startsWith('multipart/form-data;'))
  })
})
