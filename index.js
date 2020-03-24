if(process.env.NODE_ENV == "development") require("dotenv").config()
const request = require("request")
const util = require("util")
const rules = require("./config/rules")

async function getBearerToken(){
    let post = util.promisify(request.post)
    let response = await post({
        url: "https://api.twitter.com/oauth2/token",
        auth: {
            user: process.env.CONSUMER_KEY,
            pass: process.env.CONSUMER_SECRET
        },
        form: { grant_type: "client_credentials" }
    })
    return JSON.parse(response.body).access_token
}

async function getCurrentRules(token){
    let get = util.promisify(request.get)
    let response = await get({
        url: "https://api.twitter.com/labs/1/tweets/stream/filter/rules",
        auth: { bearer: token }
    })

    if(response.statusCode !== 200) throw new Error(JSON.stringify(response.body))
    return JSON.parse(response.body)
}

async function deleteRules(token, rules){
    if (!Array.isArray(rules.data)) return null

    let ids = rules.data.map(rule => rule.id)

    let post = util.promisify(request.post)
    let response = await post({
        url: "https://api.twitter.com/labs/1/tweets/stream/filter/rules",
        auth: { bearer: token },
        json: { delete: { ids: ids } }
    })

    if(response.statusCode !== 200) throw new Error(JSON.stringify(response.body))
}

async function setRules(token){
    let post = util.promisify(request.post)
    let response = await post({
        url: "https://api.twitter.com/labs/1/tweets/stream/filter/rules",
        auth: { bearer: token },
        json: { add: rules }
    })

    if(response.statusCode !== 201) throw new Error(JSON.stringify(response.body))
}

function connect(token){
    let stream = request.get({
        url: "https://api.twitter.com/labs/1/tweets/stream/filter?format=detailed",
        auth: { bearer: token }
    })

    stream.on("data", rawdata => {
        try {
            let data = JSON.parse(rawdata)
            if(data) stream.emit("tweet", data)
        } catch (e) {}

    }).on("error", e => { if(e.code === "ETIMEDOUT") stream.emit("timeout") })

    return stream
}

async function tweetHandler(tweet){
    if(tweet.data) console.log(tweet.data.text)
    else console.log(tweet)
}

async function main(){
    let token = await getBearerToken()

    let currentRules = await getCurrentRules(token)
    await deleteRules(token, currentRules)
    await setRules(token)

    let stream = connect(token)

    stream.on("tweet", tweetHandler)

    let timeout = 0
    stream.on("timeout", () => {
        console.warn('Ha ocurrido un error. Reconnecting…')
        setTimeout(() => {
          timeout++
          streamConnect(token)
        }, 2 ** timeout)
        streamConnect(token)
    })
}

main()