/**
 *
 * Search Twitter
 *
 */

const Twitter = require('twitter');

const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: "",
    access_token_secret: ""
});


exports.handler = function (event, context, callback) {

    if (event.httpMethod === "POST") {

        let bodyArray = []

        // console.log(event)

        // console.log(event.body)
        // console.log(typeof event.body)

        try {
            bodyArray = JSON.parse(event.body)
        } catch (e) {
            console.log(e)
            // body = parse(event.body)
        }

        // console.dir(bodyArray)
        // console.log(typeof bodyArray)

        let promises = []

        // callback(
        //     null, {
        //     statusCode: 200,
        //     body: JSON.stringify(body)
        // });

        bodyArray.forEach(hashTag => {
            promises.push(new Promise(function (resolve, reject) {
                // console.log(hashTag.tag)
                client.get("search/tweets", { q: hashTag.tag }, function (
                    error,
                    tweets,
                    response
                ) {
                    if (error) reject(error)
                    // console.dir(tweets);
                    hashTag.tweets = tweets
                    resolve(hashTag);
                });
            })
            );
        })

        Promise.all(promises).then((values) => {
            callback(
                null, {
                statusCode: 200,
                body: JSON.stringify(values)
            });
        });

    }

}