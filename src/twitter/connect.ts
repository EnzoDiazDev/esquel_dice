import axios from "axios";
import {IncomingMessage} from "http";

/**
 *
 * @param {IncomingMessage} stream
 *
 * @returns {IncomingMessage}
 */
export function preprocess_stream(stream:IncomingMessage):IncomingMessage {
    stream.on("data", raw_data => {
        try {
            const data = JSON.parse(raw_data);
            if(data) stream.emit("tweet", data);

        } catch (e) {/**/}

    }).on("error", error => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        if(error.code === "ETIMEDOUT") stream.emit("timeout");
    });

    return stream;
}
/**
 * Establece una conexión los tweets
 * @param {string} token access token provide by endpoint `/oauth2/token`
 *
 * @returns {Promise<IncomingMessage>}
 */
export default async function connect(token:string):Promise<IncomingMessage> {
    const url = "https://api.twitter.com/labs/1/tweets/stream/filter?format=detailed";
    const stream = await axios.get(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        },
        responseType: "stream"
    });

    return preprocess_stream(stream.data);
}
