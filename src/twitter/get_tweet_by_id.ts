import axios from "axios";

/**
 *
 * @param {string} id tweet id
 */
export default async function get_tweet_by_id(token:string, id:string):Promise<object> {
    const url = ` https://api.twitter.com/1.1/statuses/show.json?id=${id}`;
    const response = await axios.get(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    return response.data;
}
