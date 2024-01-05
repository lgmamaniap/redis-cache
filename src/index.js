const express = require('express')
const axios = require('axios')
const dotenv = require('dotenv')
const responseTime = require('response-time')
const redis = require('redis')
const Constants = require('./common/constants')

const { ControllerName, RedisKeys } = Constants

dotenv.config()

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
})

client.on('error', err => console.log('Redis Client Error', err))
client.connect()

const app = express()
app.use(responseTime())

// Controladores
app.get(`/${ControllerName.CHARACTER}`, async (req, res) => {
  const reply = await client.get(`${RedisKeys.CHARACTER}`)
  if (reply) {
    return res.json(JSON.parse(reply))
  }

  const response = await axios.get(`${process.env.API_URL}`)

  await client.set(`${RedisKeys.CHARACTER}`, JSON.stringify(response.data))

  return res.json(response.data)
})

app.get(`/${ControllerName.CHARACTER}/:id`, async (req, res) => {
  const { id } = req.params

  const reply = await client.get(`${RedisKeys.CHARACTER}:${id}`)
  if (reply) {
    return res.json(JSON.parse(reply))
  }

  const response = await axios.get(`${process.env.API_URL}/${id}`)

  await client.set(`${RedisKeys.CHARACTER}:${id}`, JSON.stringify(response.data))

  return res.json(response.data)
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running')
})