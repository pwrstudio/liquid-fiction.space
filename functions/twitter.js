/**
 *
 * Search Twitter
 *
 */

const Twitter = require('twitter');
// import { parse } from 'querystring'


const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: "",
    access_token_secret: ""
});


exports.handler = function (event, context, callback) {

    if (event.httpMethod === "POST") {

        let body = {}

        console.log(event)

        try {
            body = JSON.parse(event.body)
        } catch (e) {
            console.log(e)
            // body = parse(event.body)
        }

        console.dir(body)

        let promises = []

        callback(
            null, {
            statusCode: 200,
            body: event
        });

        // event.body.forEach(hashTag => {
        //     promises.push(new Promise(function (resolve, reject) {
        //         console.log(hashTag.tag)
        //         client.get("search/tweets", { q: hashTag.tag }, function (
        //             error,
        //             tweets,
        //             response
        //         ) {
        //             if (error) reject(error)
        //             console.dir(tweets);
        //             hashTag.tweets = tweets
        //             resolve(hashTag);
        //         });
        //     })
        //     );
        // })

        // Promise.all(promises).then((values) => {
        //     callback(
        //         null, {
        //         statusCode: 200,
        //         body: values
        //     });
        // });

    }

}