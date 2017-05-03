# Amazon Alexa Integration and You

Alexa is taking the world by storm. Since Christmas 2016, everyone is getting one to jump-start theirhome automation. As a result, it's a great time to integrate with this little device. It's also easy!

I was asked to create a custom Alexa App to integrate with Drupal 8, a popular CMS. Here's what I learned.


# The architecture

## Alexa connects to you.
Since your users talk to Alexa, you need to give Alexa a place to find you. This means you're waiting to be asked a question. Which means you're creating web services on your server or site.

## You need an SSSL Web Server
Security is no joke, and it's no surprise that Amazon requires you to impliment a secure SSL-based server.

This means you'll need a Signed certificate. For testing, you can self-sign a certificate.

## Alex has two types of App formats
You have two options:

 1. Format a sentence with keywords, and as Alexa to pass you keywords from that sentence. Think Alarms: `"Alexa, ask My_APP to set a timer for ___x___ [minutes/seconds/hours]."` In this case, Alexa tells you the command: `set alarm`, and the variables: `x`, `units`.

 2. Ask Alexa to pass you the entire user sentence, as-is.

## Get the request from Alexa, and return a response.

It's as simple as that. Alexa will hit your server, ask you something, and expect a response.



# Amazon-Side Configuration

Create a new Skill for Alexa, and complete 7 tabs:

### 1. Skill Information

 - Type: Custom
 - Name: Just a name for your reference
 - Invocation Name: This is the name you'll ask Alexa in order to enter your skill. "Alexa, Ask Drupal", "Alexa, Ask My App", etc.

### 2. Interaction Model

  - Intent Schema: This is the structure of what you can do inside you App. Here's what was used for our custom schema:

  ```
{
  "intents": [
    {
      "intent": "AMAZON.CancelIntent"
    },
    {
      "intent": "AMAZON.HelpIntent"
    },
    {
      "intent": "AMAZON.StopIntent"
    },
    {
      "slots": [
        {
          "name": "Query",
          "type": "LIST_OF_QUERIES"
        }
      ],
      "intent": "AskIntent"
    }
  ]
}
  ```

So, each intent is an action. Cancel, Stop/Exit, help, or custom. Most of these are standard, but here's the meat of our custom skill:

```
    {
      "slots": [
        {
          "name": "Query",
          "type": "LIST_OF_QUERIES"
        }
      ],
      "intent": "AskIntent"
    }
```

This list of Queries is just a list of expected questions that "close enough" questions can "snap" to. This is great for common, or difficult-to process names/words, such as the command to exit the app. Some examples include:

```
that's all
thats all
that is all
no
Who is __your_difficult_name_here__
What is __person__'s number
What is __person__'s email.
```

This isn't necessary, but helpful if you're doing custom stuff.

 - Sample Utterances: "These are what people say to interact with your skill."
   - When Alexa gives you hints like, "You can say...", they'll be pulled from here.


### 3. Configuration

 - Endpoint: AWS Lambda (You can host your code on AWS, instead of on your own server) - or - select your region, and enter your URL to your endpoint (https://yourserver.com/ask/alexa/endpoint)


### 4. SSL Certificate

 - You need to provide an SSSL certificate. We generated our own. There are links on the page to generate your own. **There are links on this page to help you generate what *they* are expecting, not the default SSL cert generation.**


### 5. Test

 - You'll enable your skill on this page. Make sure you have an Alexa tied to this account, since clicking enable will make it show up in your alexa app.
 - There is also a test service here, where you can enter your question, see the Request Alexa makes to your server, the format you'll be expecting, ad well as your server's response. It's very useful.
 	- Make sure to select your HTTPS endpoint in the dropdown here before testing.


### 6. Publishing Info, 7. Prvacy & Complicance

  - These are only needed before you leave testing, and submit your app to Amazon for public approval. They should be self-explanitory.



# Alexa JSON Request

This is what you can expect, roughly, Alexa to send to your server.
```
{
  "session": {
    "sessionId": "SessionId.abcd12-34zz-123z-1234-0b6ed24327a01234ABCD678",
    "application": {
      "applicationId": "amzn1.ask.skill.111111-2ab2-1234c-ab34-12345abcde1234"
    },
    "attributes": {},
    "user": {
      "userId": "amzn1.ask.account.SOME_LONG_USER_ID"
    },
    "new": true
  },
  "request": {
    "type": "IntentRequest",
    "requestId": "SOME_LONG.ID12345",
    "locale": "en-US",
    "timestamp": "2017-05-01T11:11:11Z",
    "intent": {
      "name": "AskIntent",
      "slots": {
        "Query": {
          "name": "Query",
          "value": "Here is the sentence asked by your user."
        }
      }
    }
  },
  "version": "1.0"
}
```

# Alex JSON Valid Response

This is, roughly, what Alexa is expecting back from you.
```
{
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "PlainText",
      "text": "This is our cool, whitty, and timely response, to be read by Alexa. We should probably prompt further questions from the user."
    },
    "card": {
      "content": "SAME HERE AS ABOVE, without the asking for mosre questions. This is probably used in the Alexa app to show the user question and our response, for sake of user history.",
      "title": "Title of Our Response",
      "type": "Simple"
    },
    "reprompt": {
      "outputSpeech": {
        "type": "PlainText",
        "text": "Do you have any other questions for Our Cool App?"
      }
    },
    "shouldEndSession": false
  },
  "sessionAttributes": {}
}
````

