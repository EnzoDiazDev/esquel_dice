import axios from "axios"

/**
 * Setea las reglas de búsqueda de la aplicación
 * @param {string} token access token provide by endpoint `/oauth2/token`
 * @param {Array} rules rules to delete
 * 
 * @returns {Promise<void>} void
 */
export default async function delete_rules(token, rules){
    if(!token) throw new Error("El token no está definido")
    if(!rules) throw new Error("Las reglas no están definidas")

    const url = "https://api.twitter.com/labs/1/tweets/stream/filter/rules"
    const ids = rules.map(rule => rule.id)

    const response = await axios.post(url, { delete: { ids } }, {
        headers: { 
            'Authorization': `Bearer ${token}`
        }
    })

    if(response.status !== 200) throw new Error(response.data)
}