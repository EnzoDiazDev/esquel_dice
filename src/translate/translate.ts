import axios, { AxiosResponse } from "axios";

/**
 * Filtra la desastrosa respuesta de la api de google para obtener el dato util
 * @param {AxiosResponse} response
 *
 * @returns {string} resultado final de la respuesta
 */
export function parse_response(response:AxiosResponse):string {
    const texts = response.data[0] as string[] || [] as string[];

    let translated_text = "";

    if(texts.length){
        const words = [];
        for(const text of texts) words.push(text[0]);
        translated_text = words.join("");
    }

    return translated_text;
}

/**
 * Traduce un texto al inglés usando el traductor de google.
 * Retorna un string vacio en caso de algún error.
 * @param {string} text text to translate
 * @param {string} source_languaje original languaje
 *
 * @return {Promise<string>} texto en inglés o un string vacío
 */
export default async function translate(text:string, source_languaje = "auto"):Promise<string> {
    if(!text) throw new Error("text no está definido");

    const url = "https://translate.googleapis.com/translate_a/single";

    let aux_error = null;
    const response = await axios.get(url, {
        params: {
            client: "gtx",
            sl: source_languaje,
            tl: "en",
            dt: "t",
            q: text
        }
    }).catch(() => aux_error = "");

    if(aux_error === "") return "";
    return parse_response(response);
}

