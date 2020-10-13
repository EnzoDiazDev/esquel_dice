import axios from "axios"

/**
 * Setea las reglas de búsqueda de la aplicación
 * @param {string} token access token provide by endpoint `/oauth2/token`
 * @param {Array} rules rules to set
 * 
 * @returns {Promise<void>} void
 */
export default async function set_rules(token, rules){
    if(!token) throw new Error("El token no está definido")
    if(!rules) throw new Error("Las reglas no están definidas")

    const url = "https://api.twitter.com/labs/1/tweets/stream/filter/rules"
    
    const response = await axios.post(url, { add: rules }, {
        headers: { 
            'Authorization': `Bearer ${token}`
        }
    })

    if(response.status !== 201) throw new Error(response.body)
}