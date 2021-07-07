if(process.env.NODE_ENV == "development") require("dotenv").config();
import get_access_token from "./twitter/get_access_token";
import get_rules from "./twitter/get_rules";
import set_rules from "./twitter/set_rules";
import delete_rules from "./twitter/delete_rules";
import get_tweet_by_id from "./twitter/get_tweet_by_id";
import connect from "./twitter/connect";
//import translate from "./translate/translate";
import {rules} from "./rules.json";
//import { IncomingMessage } from "http";

let token = "";

/**
 * @typedef stats
 * @property {number} retweet_count
 * @property {number} reply_count
 * @property {number} like_count
 * @property {number} quote_count
 */

/**
 * @typedef mention
 * @property {number} start
 * @property {number} end
 * @property {string} username
 */

/**
 * @typedef entities
 * @property {mention[]} mentions
 * @property {any} annotations
 */

/**
 * @typedef tweet
 * @property {string} id
 * @property {string} text
 * @property {entities} entities
 * @property {stats} stats
 * @property {string} lang
 * @property {{type:string, id:string}[]} referenced_tweets
 */

/**
 * Limpia un tweet, removiendo RTs, menciones y enlaces
 * @param {string} content
 *
 * @returns {string} tweet limpio
 */
// function clean_tweet(content:string):string {
//     //remove rts
//     if(content.startsWith("RT")) {/**/}
// }

/**
 *
 * @param {{data: tweet}} tweet
 * @this {IncomingMessage}
 */
async function tweet_handler(tweet):Promise<void> {
    if(tweet.data && tweet.data.text){
        const content = tweet.data.text;

        const is_rt = content.startsWith("RT @");
        if(is_rt) {
            const original_id = tweet.data.referenced_tweets
                .find(reference => reference.type === "retweeted").id;

            /**@type {tweet} */
            const original_tweet = await get_tweet_by_id(token, original_id);

            console.log(tweet.data.text);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            console.log(original_tweet.text);
            console.log("\n");
        }
    }
}

async function main(){
    token = await get_access_token();

    const current_rules = await get_rules(token);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if(current_rules.data) await delete_rules(token, current_rules.data);
    await set_rules(token, rules);

    const stream = await connect(token);
    stream.on("tweet", tweet_handler);
}

main();
