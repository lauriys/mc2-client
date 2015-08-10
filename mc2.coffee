defaults =
	channel: 'hatsuney'
lastMessageTime = 0
urlVars = {}

window.location.href.replace /[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) =>
	urlVars[key] = value

getOption = (optionName) ->
	if urlVars[optionName]?
		urlVars[optionName]
	else if defaults[optionName]?
		defaults[optionName]
	else null

tmi = new irc.client
	options:
		debug: true
	channels: [getOption('channel')]

tmi.on 'connected', =>
	tmi.emit 'message', {}, {username: 'Mikuchat'}, 'Connected!', null

tmi.on 'message', (channel, user, message, self) =>
	setTimeout () =>
		$('body').append ' \
			<span class="message animation-slide-up" style="border-left: 5px solid ' + user.color + ';"> \
				<small class="pull-right time">' + moment().format('HH:mm') + '</small> \
				<b class="pull-left" style="padding-left: 3px;">' + user.username + '</b> \
				<br /> \
				' + message.replace(/(<([^>]+)>)/ig,"") + ' \
			</span>'
	, lastMessageTime

	lastMessageTime += 1500

tmi.connect()

tmi.emit 'message', {}, {username: 'Mikuchat'}, 'Hi there! Connecting to #' + getOption('channel') + '...', null

setInterval () =>
	lastMessageTime -= 500
	if lastMessageTime < 0
		lastMessageTime = 0
, 500