const express = require('express')
const axios = require('axios')
const dotenv = require('dotenv')
const responseTime = require('response-time')
const redis = require('redis')
const { promisify } = require('util')

dotenv.config()

const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
})

const GET_ASYNC = promisify(client.get).bind(client)
const SET_ASYNC = promisify(client.set).bind(client)

// client.on('error', err => console.log('Redis Client Error', err))
// client.connect()


const app = express()
app.use(responseTime())

// Controladores
app.get('/character', async (req, res) => {
    await client.connect()
    const reply = await client.get('characters')
    if (reply) {
        return res.json(JSON.parse(reply))
    }

    const response = await axios.get(`${process.env.API_URL}`)

    await client.set('characters', JSON.stringify(response.data))

    await client.disconnect()
    return res.json(response.data)
})

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running')
})