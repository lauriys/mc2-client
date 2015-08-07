lastMessageTime = 0

tmi = new irc.client
	options:
		debug: true
	channels: ['hatsuney']

tmi.on 'connected', =>
	console.log 'yay'

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

	console.log channel
	console.log user
	console.log message

tmi.connect()

tmi.emit 'message', {}, {username: 'whatever'}, 'hello', null

setInterval () =>
	lastMessageTime -= 500
	if lastMessageTime < 0
		lastMessageTime = 0
, 500