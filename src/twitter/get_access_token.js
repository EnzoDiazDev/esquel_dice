import axios from "axios"

/**
 * Obtiene el token de acceso utilizando las credenciales que Twitter provee
 * @param {string?} consumer_key \- *default*: `process.env.CONSUMER_KEY`
 * @param {string?} consumer_secret \- *default*: `process.env.CONSUMER_SECRET`
 * @returns {Promise<string>} access token 
 */
export default async function get_access_token(consumer_key, consumer_secret){
    const url = "https://api.twitter.com/oauth2/token"
    
    const credentials = `${consumer_key || process.env.CONSUMER_KEY}:${consumer_secret || process.env.CONSUMER_SECRET}`;
    const credentialsBase64Encoded = Buffer.from(credentials).toString('base64');
   
    const response = await axios.post(url, "grant_type=client_credentials", {
        headers: {
            'Authorization': `Basic ${credentialsBase64Encoded}`
        }
    })
    
    return response.data.access_token
}