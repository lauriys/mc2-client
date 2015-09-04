defaults =
	channel: 'hatsuney'
	subs: []
	ttsCommand: null
lastMessageTime = 0
nextSpeechTime = 0
urlVars = {}

window.location.href.replace /[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) =>
	urlVars[key] = value

getOption = (optionName) ->
	if urlVars[optionName]?
		urlVars[optionName]
	else if defaults[optionName]?
		defaults[optionName]
	else null

window.speakOut = (message) ->
	audioId = Math.floor(Math.random() * 10000000)
	audioObject = soundManager.createSound
		url: 'http://translate.google.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(message) + '&tl=en-us&client=tw-ob'
		autoLoad: true
		autoPlay: false
		volume: 100
	
	setTimeout () =>
		audioObject.play()
	, nextSpeechTime

	setTimeout () =>
		audioObject.unload()
	, nextSpeechTime + (message.length * 250)

	nextSpeechTime += (message.length * 250)

	# window.speechSynthesis.speak(new SpeechSynthesisUtterance(message.replace(getOption('ttsCommand'), '')))

soundManager.setup
	flashVersion: 8
	url: '/sm2'

tmi = new irc.client
	options:
		debug: true
	channels: [getOption('channel')]

tmi.on 'connected', =>
	tmi.emit 'message', {}, {username: 'Mikuchat'}, 'Connected!', null

	if urlVars.subs?
		urlVars.subs = urlVars.subs.split ','

tmi.on 'message', (channel, user, message, self) =>
	setTimeout () =>
		subUser = user.username in getOption('subs')
		colors = {}
		if subUser
			console.log user
			if user.color?
				colors = hexToRgb shadeBlend 0.6, user.color, '#000000'
			else
				colors = hexToRgb shadeBlend 0.6, '#ffffff', '#000000'

			if getOption('ttsCommand')? and message.indexOf(getOption('ttsCommand')) == 0
				actualMessage = message.replace(getOption('ttsCommand') + ' ', '')
				speakOut actualMessage

		$('body').append ' \
			<span class="message ' + (if subUser then 'subscriber ' else '') + 'animation-slide-up" style="' + (if subUser then 'background-color: rgba(' + colors.r + ', ' + colors.g + ', ' + colors.b + ', ' + '0.7); border: 2px solid ' + user.color + '; ' else '') + 'border-left: 5px solid ' + user.color + ';"> \
				<small class="pull-right time">' + moment().format('HH:mm') + '</small> \
				' + (if subUser then '<div class="pull-left"><img class="img-circle" src="http://mikuia.tv/img/avatars/' + user.username + '.jpg" width="28" height="28" /></div> ' else '') + ' \
				<b class="pull-left" style="padding-left: 3px;"> ' + (if subUser then user['display-name'] else user.username) + '</b> \
				<br /> \
				' + message.replace(/(<([^>]+)>)/ig,"") + ' \
			</span>'
	, lastMessageTime

	lastMessageTime += 1500

tmi.connect()

tmi.emit 'message', {}, {username: 'Mikuchat'}, 'Hi there! Connecting to #' + getOption('channel') + '...', null

setInterval () =>
	lastMessageTime -= 500
	nextSpeechTime -= 500
	if lastMessageTime < 0
		lastMessageTime = 0
	if nextSpeechTime < 0
		nextSpeechTime = 0
, 500