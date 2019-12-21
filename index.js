if(process.env.NODE_ENV == "development") require("dotenv").config()
const request = require("request")
const util = require("util")

//'https://api.twitter.com/labs/1/tweets/stream/filter/rules'

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

function connect(token){
    let stream = request.get({
        url: "https://api.twitter.com/labs/1/tweets/stream/filter?format=detailed",
        auth: { bearer: token }
    })

    stream.on("data", data => {
        try {
            let dataJSON = JSON.parse(data)
            console.log(dataJSON)
        } catch (e) {}
    }).on("error", e => { if(e.code === "ETIMEDOUT") stream.emit("timeout") })

    return stream
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

async function setRules(token){
    let post = util.promisify(request.post)
    let response = await post({
        url: "https://api.twitter.com/labs/1/tweets/stream/filter/rules",
        auth: { bearer: token },
        json: { add: [
            // {
            //     "value": "point_radius:[-71.31 -42.91 40km]" 
            // },
            {
                "value": "bio: Esquel"
            },
            {
                "value": "bio: Trevelin"
            },
            {
                "value": "bio_location: Trevelin"
            },
            {
                "value": "bio_location: Esquel"
            }
        ]}
    })

    if(response.statusCode !== 201) throw new Error(JSON.stringify(response.body))
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


async function main(){
    let token = await getBearerToken()

    let currentRules = await getCurrentRules(token)
    await deleteRules(token, currentRules)
    await setRules(token)

    let stream = connect(token)

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