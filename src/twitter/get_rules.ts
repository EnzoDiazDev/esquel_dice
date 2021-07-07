import axios from "axios";

/**
 * Obtiene las reglas de busqueda de la aplicación
 * @param {string} token access token provide by endpoint `/oauth2/token`
 *
 * @returns {Promise<object>}
 */
export default async function get_rules(token:string):Promise<object> {
    if(!token) throw new Error("El token no está definido");

    const url = "https://api.twitter.com/labs/1/tweets/stream/filter/rules";

    const response = await axios.get(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if(response.status !== 200) throw new Error(response.data);

    return response.data;
}
