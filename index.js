var Slack = require('slack-client'),
	Giphy = require('giphy-api')();
	_ = require('lodash');

var slackToken = process.env.SLABORG_TOKEN,
	autoReconnect = true;

var slack = new Slack(slackToken, autoReconnect, false);

var meows = ['meow', 'miu'];

var makeMention = function(userId) {
    return '<@' + userId + '>';
};
 
var isDirect = function(userId, messageText) {
    var userTag = makeMention(userId);
    return messageText &&
           messageText.length >= userTag.length &&
           messageText.indexOf(userTag) > -1;
};

var hasMeow = function (messageText) {
	var check = _.map(meows, messageText.indexOf.bind(messageText)),
		res = _.pull(check, -1);
	return res.length > 0;
};

var meowBack = function (channel) {
	Giphy.random('kitty', function(err, res) {
		var message = 'Shut up kitty!';
		if (!err && res.data)
			message += ' '+ res.data.url;

	    channel.send(message);
	});
};

slack.on('open', function () {
    console.log("Connected to "+ slack.team.name +" as @"+ slack.self.name);
});

slack.on('message', function (message) {
	var channel = slack.getChannelGroupOrDMByID(message.channel);
	var user = slack.getUserByID(message.user);

    if (message.type === 'message' 
    	&& isDirect(slack.self.id, message.text)
    	&& hasMeow(message.text)) {
    	meowBack(channel);
    }
});

slack.on('error', function (err) {
    console.error("Error", err);
});

slack.login()