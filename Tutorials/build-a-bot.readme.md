# Build a conversation bot

## Platforms for User Interfacing
1. Amazon Alexa (voice)
2. Slack (chat)
3. Facebook Messenger (chat)

## NLP
1. Amazon Alexa
2. Api.ai
3. Wit.ai

## Host it Simply
1. Heroku
2. Runkit
3. AWS Lambda


# Slack Bot

## Create an App at `api.slack.com`

### 1. Create a new App, Give it a name and assign it to a team.

	- An app must live under a team, even if you intend to distribute it. That doesn't mean users will have access to that team.

### 2. Determine which features to use:

	- WebHooks - A simple way to POST from external sources. Simple, but limited.
	- Slash Commands - When you type `/some-command` in slack, like `/gif some search`.
	- Bots - Create a user that a bot can talk through. Think `SlackBot`.
	- Event Subscriptions - Subscribe your app to recieve data when certain events are triggered. Things like `a message happens in a room`, or `someone joins a room`, or `someone adds an emoji`.

### 3. Install your app to a team.

Pretty straight forward. Enable your app inside one of your teams.


### App Credentials

 Slack uses oAuth and tokens for a lot of stuff, and you'll need the `Client ID`, `Client Secret`, and `Verification Token` generated on this page in order to do most things.




## Authenticate your App Server with Slack

Before we get to coding our app, we need to handle Slack's oAuth for validating our app server. This means we need an endpoint to accept the oAuth request:

1. Click `OAuth & Permissions` in the api.Slack admin panel for your app.
2. Add `Redirect URLs`, and endpoint where Slack will hit in order to authenticate with your app's server. Save that.
3. Next, make sure you have the Client ID, Client Secret and Verification Token given to you when you created your app. Or, in the Slack API admin for you app, click `Basic Information`, on the left.
4. Now, we'll add these to (and make) our node.js app. Here's the basics:


```
var express = require('express'),
		request = require('request'),
		bodyParser = require('body-parser'),
		app = express();

// This route handles get request to a /oauth endpoint. We'll use this endpoint for handling the logic of the Slack oAuth process behind our app.
app.get('/oauth', function(req, res) {
	oAuth(req, res);
});


function oAuth(req, res) {
	// When a user authorizes an app, a code query parameter is passed on the oAuth endpoint.
	if (!req.query.code) {
    res.status(500);
    res.send({"Error": "Looks like we're not getting code."});
  }
  else {
    // We'll do a GET call to Slack's `oauth.access` endpoint, adding the client ID, client secret, and the code Slack just passed to us.

    request({
        url: 'https://slack.com/api/oauth.access',
        // Query string
        qs: {
        	code: req.query.code,
        	client_id: "Your client ID, found in the SLACK admin,
        	client_secret: "Your Client Secret, same place as above"
        },
        method: 'GET',
    },
    function (error, response, body) {
        if (error) {
            console.log(error);
        }
        else {
            res.json(body);
        }
    });
  }
}
```

5. Make sure that your Client ID, Client Secret, and Token are placed somewhere secure. **Don't share them, and don't put them up on a public repo!** If you're not sure, consider using
`require('dotenv').config();`. dotenv is on NPM, and can be installed with `npm install dotenv --save` from the root of your new node app.



## Decide what type of App You're making

Are you using a `/slash command` tinitiated by your users? Are you listening to the room, and keeping track of data? Are you "talking" through a user bot inside slack? Each of these things have different levels of effort.

### /slash commands
These are probably the easiest, and don't require https.

When you get a request for one of these, you simply respond with a body. In Express (node.js), just do:

```
// Route the endpoint that our slash command will point to and send back a simple response to indicate that ngrok is working
app.post('/api/command', function(req, res) {
  res.send('Hello World!');
});
```

Inside the app interface at api.slack.com, visit the `Slash Commands` link on the left-hand menu. Then, set up a URL for this to point to, and the command itself.


### Event API

The event API starts with a list of evenets you can subscribe to. You do this in the api.slack.com interface, under `Event Subscriptions`.

	- Enable this by turning it on in the menu.
	- Provide a URL (endpoint) for Slack to hit to send any events.
	- Subscribe to `Team Events`, and/or `Bot Events`.
		- Team Events occur within the entire team
		- Bot Events only occur somewhere that your Bot exists. If your bot user is not in the room, they don't see the events, so Slack doesn't send them to your bot.

	`message.channel` is a good one, if you want to see all messages within the channel where your bot lives.

#### Setup Authentication for your Event URL

Slack requires verification that your event URL is valid, and they expect you to verify that any messages they send are really from Slack. So, we'll need to be ready for a `url_verification` POST to the endpoint you provided when setting up your Event API URL above.

In node, using express, do something like this.

```
var express = require('express'),
		bodyParser = require('body-parser'),
		app = express();

// Some quick helpers to let us read encoded bodies, like JSON and URL-encoded bodies.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// We configured this endpoint in the Slack API, just for our /slash command.
app.post('/event-api', function(req, res) {

	// If the body has a {type: 'url_verification' }, we need to verify
	// with Slack that this endpoint is kosher.
	if (typeof req.body.type !== 'undefined' && req.body.type == 'url_verification') {
		// Check our token against the one Slack sent in the request.
		// If they don't match, ignore the request.
		if (tokenVerify(req,res) === true) {

			// See the challenge variable passed in the request? 
			// Slack just wants a response with that token, so they know
			// we're a Slack Bot.
			var verify_challenge = req.body.challenge;

			// Check and return challenge token. That's all we have to do!
			res.json({"challenge" : verify_challenge});
		}
	}
	// Otherwise, we've got a request.
	// Send the response to the slash command back to the user that initiated it.
	else {
		// This is a function that check's the passed token, and makes sure
		// Slack sent this, and no one else.
		if (slackAuth.tokenVerify(req,res) === true) {
			// Just output a vanilla body. It'll be printed in the Slack channel
			// where this call came from.
			res.send('We got it!');
		}
	}
}


function tokenVerify(req, Slack_Verify_Token) {
		// Check token matches our expected token.
		if (Slack_Verify_Token !== req.body.token) {
			return false;
		}
		return true;
	}
```