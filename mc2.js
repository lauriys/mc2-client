var avatars = {};
var badge_sets = {};
var defaults = {
	channel: 'hatsuney',
	subs: []
}
var lastMessageTime = 0;
var urlVars = {};

window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
	urlVars[key] = value;
});

function getOption(optionName) {
	if(urlVars[optionName] != null) {
		return urlVars[optionName];
	} else if(defaults[optionName] != null) {
		return defaults[optionName];
	} else {
		return null;
	}
}

var chat = new tmi.client({
	options: {
		debug: true
	},
	channels: [getOption('channel')]
});

chat.on('connected', () => {
	chat.emit('chat', {}, {username: 'Mikuchat'}, 'Connected to Twitch!', null);

	if(urlVars.subs != null) {
		urlVars.subs = urlVars.subs.split(',');
	}
});

chat.on('roomstate', (channel, state) => {
	if(state['room-id'] != null) {
		$.get('https://badges.twitch.tv/v1/badges/channels/' + state['room-id'] + '/display?language=en', (data) => {
			if(data.badge_sets.subscriber != null) {
				badge_sets.subscriber = data.badge_sets.subscriber;
			}
		});
	}
})

chat.on('chat', (channel, userstate, message, self) => {
	console.log(userstate);
	var subUser = getOption('subs').indexOf(userstate.username) > -1 || userstate.subscriber;
	var randomId = Math.floor(Math.random() * 10000000);
	var badges = "";
	var colors = {};

	if(subUser) {
		// console.log(user);
		if(userstate.color != null) {
			colors = hexToRgb(shadeBlend(0.7, userstate.color, '#000000'));
		} else {
			colors = hexToRgb(shadeBlend(0.7, '#ffffff', '#000000'));
		}

		if(avatars[userstate['user-id']] == null) {
			$.get('https://api.twitch.tv/kraken/users/' + userstate['user-id'] + '?client_id=5mfq8m9p37uhi6lud582jasq6cro27&api_version=5', (data) => {
				if(data.logo != null) {
					avatars[userstate['user-id']] = data.logo;
				} else {
					avatars[userstate['user-id']] = false;
				}
			});
		}

	}

	var lightUsernameColor = '#ffffff';
	if(userstate.color != null) {
		lightUsernameColor = shadeBlend(0.4, userstate.color, '#ffffff');
	}

	message = message.replace(/(<([^>]+)>)/ig, '');

	if(userstate['badges-raw'] != null) {
		var badgeInstances = userstate['badges-raw'].split(',');
		for(let badgeInstanceId in badgeInstances) {
			var badgeInstance = badgeInstances[badgeInstanceId];
			var badgeTokens = badgeInstance.split('/');
			var badgeName = badgeTokens[0];
			var badgeVersion = badgeTokens[1];

			if(badge_sets[badgeName] != null && badge_sets[badgeName].versions[badgeVersion] != null) {
				badges += '<img class="badge" src="' + badge_sets[badgeName].versions[badgeVersion].image_url_4x + '" />'
			}
		}
	}

	if(subUser) {
		if(avatars[userstate['user-id']] != null && avatars[userstate['user-id']] != false) {
			badges += '<img class="img-circle badge" src="' + avatars[userstate['user-id']] + '" />';
		}
	}

	// (subUser ? '<img class="img-circle badge" src="http://mikuia.tv/img/avatars/' + userstate.username + '.jpg" width="28" height="28" /> ' : '') + '

	if(userstate['emotes-raw'] != null) {
		var emoteInstances = userstate['emotes-raw'].split('/').reverse();
		for(let emoteInstanceId in emoteInstances) {
			var emoteInstance = emoteInstances[emoteInstanceId];
			var emoteTokens = emoteInstance.split(':');
			var emoteId = emoteTokens[0];
			var emotePos = emoteTokens[1].split('-');
			var startPos = parseInt(emotePos[0]);
			var endPos = parseInt(emotePos[1]);

			message = message.substr(0, startPos) + '<img class="emote" src="https://static-cdn.jtvnw.net/emoticons/v1/' + emoteId + '/3.0" />' + message.substr(endPos + 1);				

		}
		// var tokens = message.split(' ');
		// console.log(tokens);


		// for(let emoteId in userstate.emotes) {
		// 	var instances = userstate.emotes[emoteId].reverse();
		// 	for(var emote in instances) {
		// 		var emotePosition = instances[emote].split('-');
		// 		var startPos = parseInt(emotePosition[0]);
		// 		var endPos = parseInt(emotePosition[1]);

		// 		message = message.substr(0, startPos) + '<img class="emote" src="https://static-cdn.jtvnw.net/emoticons/v1/' + emoteId + '/2.0" />' + message.substr(endPos + 1);				
		// 	}
		// }

		console.log('DETECTED EMOTES OMG');
	}

	$('#messages').append(' \
		<span id="message_' + randomId + '" class="message ' + (subUser ? 'subscriber ' : '') + 'animated fadeIn" style="' + (subUser ? 'background-color: rgba(' + colors.r + ',' + colors.g + ',' + colors.b + ', 0.7); border: 1px solid ' + lightUsernameColor + '; ' : '') + 'border-left: 5px solid ' + lightUsernameColor + ';"> \
			<small class="pull-right time">' + moment().format('HH:mm') + '</small> \
			<div class="pull-left">' + badges + '</div> \
			<b class="pull-left" style="color: ' + lightUsernameColor + ';"> ' + (userstate['display-name'] ? userstate['display-name'] : userstate.username) + '</b> \
			<br />' + message + '</span>');
	
	setTimeout(() => {
		$('#message_' + randomId).addClass('slideOutRight);')
	}, 2500);

	setTimeout(() => {
		$('#message_' + randomId).remove();
	}, 3500);
});

chat.connect({
	connection: {
		cluster: 'main',
		reconnect: true
	}
});

setInterval(() => {
	lastMessageTime -= 500;
}, 500);

// var mc2 = io.connect('http://mc2.hatsu.tv');

// mc2.on('connect', (data) => {
// 	chat.emit('chat', {}, {username: 'Mikuchat'}, 'Connected to mc2!', null);
// });

// mc2.on('hello', (data) => {
// 	console.log(data);
// });

$.get('https://badges.twitch.tv/v1/badges/global/display?language=en', (data) => {
	badge_sets = data.badge_sets;
});