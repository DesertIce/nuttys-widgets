////////////////
// PARAMETERS //
////////////////

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const sbServerAddress = urlParams.get("address") || "127.0.0.1";
const sbServerPort = urlParams.get("port") || "8080";
const avatarMap = new Map();

const mainContainer = document.getElementById('mainContainer');
const alertBox = document.getElementById('alertBox');
const avatarElement = document.getElementById('avatar');
const avatarSmallElement = document.getElementById('avatarButItsSmallerThanTheOneFromBeforeForPrettinessPurposes');
const usernameLabel = document.getElementById('username');
const usernameTheSecondLabel = document.getElementById('usernameTheSecond');
const descriptionLabel = document.getElementById('description');
const attributeLabel = document.getElementById('attribute');
const theContentThatShowsFirstInsteadOfSecond = document.getElementById('theContentThatShowsFirstInsteadOfSecond');
const theContentThatShowsLastInsteadOfFirst = document.getElementById('theContentThatShowsLastInsteadOfFirst');
const messageLabel = document.getElementById('message');

let widgetLocked = false;						// Needed to lock animation from overlapping
let alertQueue = [];

/////////////
// OPTIONS //
/////////////

// Appearance
const showAvatar = GetBooleanParam("showAvatar", true);
const font = urlParams.get("font") || "";
const fontSize = GetIntParam("fontSize", 30);
const fontColor = urlParams.get("fontColor") || "#FFFFFF";
const useCustomBackground = GetBooleanParam("useCustomBackground", true);
const background = urlParams.get("background") || "#000000";
const opacity = urlParams.get("opacity") || "0.85";
const textAlignment = urlParams.get("textAlignment") || "left";
const alignment = urlParams.get("alignment") || "";

// General
const hideAfter = GetIntParam("hideAfter", 8);
const showAnimation = urlParams.get("showAnimation") || "";
const hideAnimation = urlParams.get("hideAnimation") || "";
const playSounds = GetBooleanParam("playSounds", true);
const globalShowAction = urlParams.get("globalShowAction") || "";
const globalHideAction = urlParams.get("globalHideAction") || "";
const showMesesages = GetBooleanParam("showMesesages", true);

// Which Twitch alerts do you want to see?
const showTwitchFollows = GetBooleanParam("showTwitchFollows", false);
const twitchFollowAction = urlParams.get("twitchFollowAction") || "";
const showTwitchSubs = GetBooleanParam("showTwitchSubs", true);
const twitchSubAction = urlParams.get("twitchSubAction") || "";
const showTwitchChannelPointRedemptions = GetBooleanParam("showTwitchChannelPointRedemptions", true);
const twitchChannelPointRedemptionAction = urlParams.get("twitchChannelPointRedemptionAction") || "";
const showTwitchCheers = GetBooleanParam("showTwitchCheers", true);
const twitchCheerAction = urlParams.get("twitchCheerAction") || "";
const showTwitchRaids = GetBooleanParam("showTwitchRaids", true);
const twitchRaidAction = urlParams.get("twitchRaidAction") || "";

// Which YouTube alerts do you want to see?
const showYouTubeSuperChats = GetBooleanParam("showYouTubeSuperChats", true);
const youtubeSuperChatAction = urlParams.get("youtubeSuperChatAction") || "";
const showYouTubeSuperStickers = GetBooleanParam("showYouTubeSuperStickers", true);
const youtubeSuperStickerAction = urlParams.get("youtubeSuperStickerAction") || "";
const showYouTubeMemberships = GetBooleanParam("showYouTubeMemberships", true);
const youtubeMembershipAction = urlParams.get("youtubeMembershipAction") || "";

// Which donation alerts do you want to see?
const showStreamlabsDonations = GetBooleanParam("showStreamlabsDonations", false);
const streamlabsDonationAction = urlParams.get("streamlabsDonationAction") || "";
const showStreamElementsTips = GetBooleanParam("showStreamElementsTips", false);
const streamelementsTipAction = urlParams.get("streamelementsTipAction") || "";
const showPatreonMemberships = GetBooleanParam("showPatreonMemberships", false);
const patreonMembershipActions = urlParams.get("patreonMembershipActions") || "";
const showKofiDonations = GetBooleanParam("showKofiDonations", false);
const kofiDonationAction = urlParams.get("kofiDonationAction") || "";
const showTipeeeStreamDonations = GetBooleanParam("showTipeeeStreamDonations", false);
const tipeeestreamDonationAction = urlParams.get("tipeeestreamDonationAction") || "";
const showFourthwallAlerts = GetBooleanParam("showFourthwallAlerts", false);
const fourthwallAlertAction = urlParams.get("fourthwallAlertAction") || "";

// Set avatar visibility
if (!showAvatar) {
	avatarElement.style.display = 'none';
	avatarSmallElement.style.display = 'none';
	alertBox.style.padding = '0.5em 1em';
}

// Set fonts for the widget
document.body.style.fontFamily = font;
document.body.style.fontSize = `${fontSize}px`;
document.body.style.color = fontColor;

// Set custom background
if (useCustomBackground) {
	const opacity255 = Math.round(parseFloat(opacity) * 255);
	let hexOpacity = opacity255.toString(16);
	if (hexOpacity.length < 2) {
		hexOpacity = "0" + hexOpacity;
	}
	//document.body.style.background = `${background}${hexOpacity}`;
	console.log(`${background}${hexOpacity}`);
	document.documentElement.style.setProperty('--custom-background', `${background}${hexOpacity}`);
}

// Set text alignment
document.documentElement.style.setProperty('--text-align', textAlignment);

// Set the alignment of the alert box
switch (alignment)
{
	case "align-to-top":
		mainContainer.style.justifyContent = 'flex-start';
		break;
	case "align-to-center":
		mainContainer.style.justifyContent = 'center';
		break;
	case "align-to-bottom":
		mainContainer.style.justifyContent = 'flex-end';
		break;
}



/////////////////////////
// STREAMER.BOT CLIENT //
/////////////////////////

const client = new StreamerbotClient({
	host: sbServerAddress,
	port: sbServerPort,

	onConnect: (data) => {
		console.log(`Streamer.bot successfully connected to ${sbServerAddress}:${sbServerPort}`)
		console.debug(data);
		SetConnectionStatus(true);
	},

	onDisconnect: () => {
		console.error(`Streamer.bot disconnected from ${sbServerAddress}:${sbServerPort}`)
		SetConnectionStatus(false);
	}
});

client.on('Twitch.Follow', (response) => {
	console.debug(response.data);
	TwitchFollow(response.data);
})

client.on('Twitch.Cheer', (response) => {
	console.debug(response.data);
	TwitchCheer(response.data);
})

client.on('Twitch.Sub', (response) => {
	console.debug(response.data);
	TwitchSub(response.data);
})

client.on('Twitch.ReSub', (response) => {
	console.debug(response.data);
	TwitchResub(response.data);
})

client.on('Twitch.GiftSub', (response) => {
	console.debug(response.data);
	TwitchGiftSub(response.data);
})

client.on('Twitch.GiftBomb', (response) => {
	console.debug(response.data);
	TwitchGiftBomb(response.data);
})

client.on('Twitch.RewardRedemption', (response) => {
	console.debug(response.data);
	TwitchRewardRedemption(response.data);
})

client.on('Twitch.Raid', (response) => {
	console.debug(response.data);
	TwitchRaid(response.data);
})

client.on('YouTube.SuperChat', (response) => {
	console.debug(response.data);
	YouTubeSuperChat(response.data);
})

client.on('YouTube.SuperSticker', (response) => {
	console.debug(response.data);
	YouTubeSuperSticker(response.data);
})

client.on('YouTube.NewSponsor', (response) => {
	console.debug(response.data);
	YouTubeNewSponsor(response.data);
})

client.on('YouTube.GiftMembershipReceived', (response) => {
	console.debug(response.data);
	YouTubeGiftMembershipReceived(response.data);
})

client.on('Streamlabs.Donation', (response) => {
	console.debug(response.data);
	StreamlabsDonation(response.data);
})

client.on('StreamElements.Tip', (response) => {
	console.debug(response.data);
	StreamElementsTip(response.data);
})

client.on('Patreon.PledgeCreated', (response) => {
	console.debug(response.data);
	PatreonPledgeCreated(response.data);
})

client.on('Kofi.Donation', (response) => {
	console.debug(response.data);
	KofiDonation(response.data);
})

client.on('Kofi.Subscription', (response) => {
	console.debug(response.data);
	KofiSubscription(response.data);
})

client.on('Kofi.Resubscription', (response) => {
	console.debug(response.data);
	KofiResubscription(response.data);
})

client.on('Kofi.ShopOrder', (response) => {
	console.debug(response.data);
	KofiShopOrder(response.data);
})

client.on('TipeeeStream.Donation', (response) => {
	console.debug(response.data);
	TipeeeStreamDonation(response.data);
})

client.on('Fourthwall.OrderPlaced', (response) => {
	console.debug(response.data);
	FourthwallOrderPlaced(response.data);
})

client.on('Fourthwall.Donation', (response) => {
	console.debug(response.data);
	FourthwallDonation(response.data);
})

client.on('Fourthwall.SubscriptionPurchased', (response) => {
	console.debug(response.data);
	FourthwallSubscriptionPurchased(response.data);
})

client.on('Fourthwall.GiftPurchase', (response) => {
	console.debug(response.data);
	FourthwallGiftPurchase(response.data);
})

client.on('Fourthwall.GiftDrawStarted', (response) => {
	console.debug(response.data);
	FourthwallGiftDrawStarted(response.data);
})

client.on('Fourthwall.GiftDrawEnded', (response) => {
	console.debug(response.data);
	FourthwallGiftDrawEnded(response.data);
})



///////////////////////
// MULTICHAT OVERLAY //
///////////////////////

async function TwitchFollow(data) {
	if (!showTwitchFollows)
		return;

	// Set the text
	const username = data.user_name;

	// Render avatars
	const avatarURL = await GetAvatar(username);

	UpdateAlertBox(
		'twitch',
		avatarURL,
		`${username}`,
		`followed`,
		``,
		username,
		``,
		twitchFollowAction,
		data
	);
}

async function TwitchCheer(data) {
	if (!showTwitchCheers)
		return;

	// Set the text
	const username = data.message.displayName;
	const bits = data.bits;
	let message = data.message.message;

	// Render avatars
	const avatarURL = await GetAvatar(username);

	// Render emotes
	for (i in data.emotes) {
		const emoteElement = `<img src="${data.emotes[i].imageUrl}" class="emote"/>`;
		const emoteName = EscapeRegExp(data.emotes[i].name);

		let regexPattern = emoteName;

		// Check if the emote name consists only of word characters (alphanumeric and underscore)
		if (/^\w+$/.test(emoteName)) {
			regexPattern = `\\b${emoteName}\\b`;
		}
		else {
			// For non-word emotes, ensure they are surrounded by non-word characters or boundaries
			regexPattern = `(?:^|[^\\w])${emoteName}(?:$|[^\\w])`;
		}

		const regex = new RegExp(regexPattern, 'g');
		message = message.replace(regex, emoteElement);
	}

	// Render cheermotes
	for (i in data.cheerEmotes) {
		const bits = data.cheerEmotes[i].bits;
		const imageUrl = data.cheerEmotes[i].imageUrl;
		const name = data.cheerEmotes[i].name;
		const cheerEmoteElement = `<img src="${imageUrl}" class="emote"/>`;
		const bitsElements = `<span class="bits">${bits}</span>`
		message = message.replace(new RegExp(`\\b${name}${bits}\\b`, 'i'), cheerEmoteElement + bitsElements);
	}

	UpdateAlertBox(
		'twitch',
		avatarURL,
		`${username}`,
		`cheered ${bits} bits`,
		'',
		username,
		message,
		twitchCheerAction,
		data
	);
}

async function TwitchSub(data) {
	if (!showTwitchSubs)
		return;

	// Set the text
	const username = data.user.name;
	const subTier = data.sub_tier;
	const isPrime = data.is_prime;

	// Render avatars
	const avatarURL = await GetAvatar(username);

	if (!isPrime)
		UpdateAlertBox(
			'twitch',
			avatarURL,
			`${username}`,
			`subscribed with Tier ${subTier.charAt(0)}`,
			'',
			username,
			'',
			twitchSubAction,
			data
		);
	else
		UpdateAlertBox(
			'twitch',
			avatarURL,
			`${username}`,
			`used their Prime Sub`,
			'',
			username,
			'',
			twitchSubAction,
			data
		);
}

async function TwitchResub(data) {
	if (!showTwitchSubs)
		return;

	// Set the text
	const username = data.user.name;
	const subTier = data.subTier;
	const isPrime = data.isPrime;
	const cumulativeMonths = data.cumulativeMonths;
	const message = data.text;

	// Render avatars
	const avatarURL = await GetAvatar(username);

	if (!isPrime)
		UpdateAlertBox(
			'twitch',
			avatarURL,
			`${username}`,
			`resubscribed with Tier ${subTier.charAt(0)}`,
			`${cumulativeMonths} months`,
			username,
			message,
			twitchSubAction,
			data
		);
	else
		UpdateAlertBox(
			'twitch',
			avatarURL,
			`${username}`,
			`used their Prime Sub`,
			`${cumulativeMonths} months`,
			username,
			message,
			twitchSubAction,
			data
		);
}

async function TwitchGiftSub(data) {
	if (!showTwitchSubs)
		return;

	// Set the text
	const username = data.user.name;
	const subTier = data.subTier;
	const recipient = data.recipient.name;
	const cumlativeTotal = data.cumlativeTotal;
	const fromCommunitySubGift = data.fromCommunitySubGift;

	// Don't post alerts for gift bombs
	if (fromCommunitySubGift)
		return;

	// Render avatars
	const avatarURL = await GetAvatar(username);
	
	let messageText = '';
	if (cumlativeTotal > 0)
		messageText = `They've gifted ${cumlativeTotal} subs in total!`;

	UpdateAlertBox(
		'twitch',
		avatarURL,
		`${username}`,
		`gifted a Tier ${subTier.charAt(0)} subscription`,
		`to ${recipient}`,
		username,
		messageText,
		twitchSubAction,
		data
	);
}

async function TwitchGiftBomb(data) {
	if (!showTwitchSubs)
		return;

	//// The below is incorrect (Streamer.bot documentation is wrong)
	// const username = data.displayName;
	// const gifts = data.gifts;
	// const totalGifts = data.totalGifts;
	// const subTier = data.subTier;
	const username = data.user.name;
	const login = data.user.login;
	const gifts = data.recipients.length;
	const totalGifts = data.cumulative_total;
	const subTier = data.sub_tier.charAt(0);

	// Render avatars
	const avatarURL = await GetAvatar(login);

	let message = ``;
	if (totalGifts > 0)
		message = `They've gifted ${totalGifts} subs in total!`;

	UpdateAlertBox(
		'twitch',
		avatarURL,
		`${username}`,
		`gifted ${gifts} Tier ${subTier} subs!`,
		``,
		username,
		message,
		twitchSubAction,
		data
	);
}

async function TwitchRewardRedemption(data) {
	if (!showTwitchChannelPointRedemptions)
		return;

	const username = data.user_name;
	const rewardName = data.reward.title;
	const cost = data.reward.cost;
	const userInput = data.user_input;
	const channelPointIcon = `<img src="icons/badges/twitch-channel-point.png" class="platform" style="height: 1em"/>`;

	// Render avatars
	const avatarURL = await GetAvatar(data.user_login);

	UpdateAlertBox(
		'twitch',
		avatarURL,
		`${username} redeemed`,
		`${rewardName} ${channelPointIcon} ${cost}`,
		'',
		username,
		userInput,
		twitchChannelPointRedemptionAction,
		data
	);
}

async function TwitchRaid(data) {
	if (!showTwitchRaids)
		return;

	// Render avatars
	const avatarURL = await GetAvatar(data.from_broadcaster_user_login);

	// Set the text
	const username = data.from_broadcaster_user_login;
	const viewers = data.viewers;
	
	UpdateAlertBox(
		'twitch',
		avatarURL,
		`${username}`,
		`is raiding with a party of ${viewers}`,
		'',
		username,
		'',
		twitchRaidAction,
		data
	);
}

function YouTubeSuperChat(data) {
	if (!showYouTubeSuperChats)
		return;
	
	// Render avatars
	const avatarURL = data.user.profileImageUrl;

	UpdateAlertBox(
		'youtube',
		avatarURL,
		`${data.user.name}`,
		`sent a Super Chat (${data.amount})`,
		'',
		data.user.name,
		data.message,
		youtubeSuperChatAction,
		data
	);
}

function YouTubeSuperSticker(data) {
	if (!showYouTubeSuperStickers)
		return;
	
	// Render avatars
	const avatarURL = FindFirstImageUrl(data);

	UpdateAlertBox(
		'youtube',
		avatarURL,
		`${data.user.name}`,
		`sent a Super Sticker (${data.amount})`,
		'',
		data.user.name,
		'',
		youtubeSuperStickerAction,
		data
	);
}

function YouTubeNewSponsor(data) {
	if (!showYouTubeMemberships)
		return;
	
	// Render avatars
	const avatarURL = data.user.profileImageUrl;

	UpdateAlertBox(
		'youtube',
		avatarURL,
		`⭐ New ${data.levelName}`,
		`Welcome ${data.user.name}!`,
		'',
		data.user.name,
		'',
		youtubeMembershipAction,
		data
	);
}

function YouTubeGiftMembershipReceived(data) {
	if (!showYouTubeMemberships)
		return;
	
	// Render avatars
	const avatarURL = data.user.profileImageUrl;

	UpdateAlertBox(
		'youtube',
		avatarURL,
		`${data.gifter.name}`,
		`gifted a membership`,
		`to ${data.user.name} (${data.tier})!`,
		data.gifter.name,
		'',
		youtubeMembershipAction,
		data
	);
}

async function StreamlabsDonation(data) {
	if (!showStreamlabsDonations)
		return;

	// Set the text
	const donater = data.from;
	const formattedAmount = data.formattedAmount;
	const currency = data.currency;
	const message = data.message;

	UpdateAlertBox(
		'streamlabs',
		'',
		`${donater}`,
		`donated ${currency}${formattedAmount}`,
		``,
		donater,
		message,
		streamlabsDonationAction,
		data
	);
}

async function StreamElementsTip(data) {
	if (!showStreamElementsTips)
		return;

	// Set the text
	const donater = data.username;
	const formattedAmount = `$${data.amount}`;
	const currency = data.currency;
	const message = data.message;

	UpdateAlertBox(
		'streamelements',
		''
		`${donater}`,
		`donated ${currency}${formattedAmount}`,
		``,
		donater,
		message,
		streamelementsTipAction,
		data
	);
}

function PatreonPledgeCreated(data) {
	if (!showPatreonMemberships)
		return;

	const user = data.attributes.full_name;
	const amount = (data.attributes.will_pay_amount_cents/100).toFixed(2);
	const patreonIcon = `<img src="icons/platforms/patreon.png" class="platform"/>`;
	
	// Render avatars
	const avatarURL = 'icons/platforms/patreon.png';
	
	UpdateAlertBox(
		'patreon',
		avatarURL,
		`${user}`,
		`joined Patreon ($${amount})`,
		``,
		user,
		``,
		patreonMembershipActions,
		data
	);
}

function KofiDonation(data) {
	if (!showKofiDonations)
		return;

	// Set the text
	const user = data.from;
	const amount = data.amount;
	const currency = data.currency;
	const message = data.message;
	
	// Render avatars
	const avatarURL = 'icons/platforms/kofi.png';

	if (currency == "USD")
		UpdateAlertBox(
			'kofi',
			avatarURL,
			`${user}`,
			`donated $${amount}`,
			``,
			user,
			message,
			kofiDonationAction,
			data
		);
	else
		UpdateAlertBox(
			'kofi',
			`${user}`,
			`donated ${currency} ${amount}`,
			``,
			user,
			message,
			kofiDonationAction,
			data
		);
}

function KofiSubscription(data) {
	if (!showKofiDonations)
		return;

	// Set the text
	const user = data.from;
	const amount = data.amount;
	const currency = data.currency;
	const message = data.message;
	
	// Render avatars
	const avatarURL = 'icons/platforms/kofi.png';

	if (currency == "USD")
		UpdateAlertBox(
			'kofi',
			avatarURL,
			`${user}`,
			`subscribed ($${amount})`,
			``,
			user,
			message,
			kofiDonationAction,
			data
		);
	else
		UpdateAlertBox(
			'kofi',
			`${user}`,
			`subscribed (${currency} ${amount})`,
			``,
			user,
			message,
			kofiDonationAction,
			data
		);
}

function KofiResubscription(data) {
	if (!showKofiDonations)
		return;

	// Set the text
	const user = data.from;
	const tier = data.tier;
	const message = data.message;
	
	// Render avatars
	const avatarURL = 'icons/platforms/kofi.png';

	UpdateAlertBox(
		'kofi',
		avatarURL,
		`${user}`,
		`subscribed (${tier})`,
		``,
		user,
		message,
		kofiDonationAction,
		data
	);
}

function KofiShopOrder(data) {
	if (!showKofiDonations)
		return;

	// Set the text
	const user = data.from;
	const amount = data.amount;
	const currency = data.currency;
	const message = data.message;
	const itemTotal = data.items.length;
	let formattedAmount = "";

	if (amount == 0)
		formattedAmount = ""
	else if (currency == "USD")
		formattedAmount = `$${amount}`;
	else
		formattedAmount = `${currency} ${amount}`;
	
	// Render avatars
	const avatarURL = 'icons/platforms/kofi.png';

	UpdateAlertBox(
		'kofi',
		avatarURL,
		`${user}`,
		`ordered ${itemTotal} item(s) on Ko-fi `,
		`${formattedAmount}`,
		user,
		message,
		kofiDonationAction,
		data
	);
}

function TipeeeStreamDonation(data) {
	if (!showTipeeeStreamDonations)
		return;

	// Set the text
	const user = data.username;
	const amount = data.amount;
	const currency = data.currency;
	const message = data.message;
	
	// Render avatars
	const avatarURL = 'icons/platforms/tipeeeStream.png';

	if (currency == "USD")
		UpdateAlertBox(
			'tipeeeStream',
			avatarURL,
			`${user}`,
			`donated $${amount}`,
			``,
			user,
			message,
			tipeeestreamDonationAction,
			data
		);
	else
		UpdateAlertBox(
			'tipeeeStream',
			avatarURL,
			`${user}`,
			`donated ${currency} ${amount}`,
			``,
			user,
			message,
			tipeeestreamDonationAction,
			data
		);
}

function FourthwallOrderPlaced(data) {
	if (!showFourthwallAlerts)
		return;

	// Set the text
	let user = data.username;
	const orderTotal = data.total;
	const currency = data.currency;
	const item = data.variants[0].name;
	const itemsOrdered = data.variants.length;
	const message = DecodeHTMLString(data.statmessageus);
	const itemImageUrl = data.variants[0].image;

	// If there user did not provide a username, just say "Someone"
	if (user == undefined)
		user = "Someone";

	let attributeText = ""

	// If the user ordered more than one item, write how many items they ordered
	if (itemsOrdered > 1)
		attributeText += `and ${itemsOrdered - 1} other item(s)!`;

	// If the user spent money, put the order total
	if (orderTotal == 0)
		attributeText += ``;
	else if (currency == "USD")
		attributeText += ` ($${orderTotal})`;
	else
		attributeText += ` (${orderTotal} ${currency})`;

	UpdateAlertBox(
		'fourthwall',
		itemImageUrl,
		`${user}`,
		`ordered ${item}`,
		attributeText,
		user,
		message,
		fourthwallAlertAction,
		data
	);
}

function FourthwallDonation(data) {
	if (!showFourthwallAlerts)
		return;

	// Set the text
	let user = data.username;
	const amount = data.amount;
	const currency = data.currency;
	const message = data.message;

	let formattedAmount = '';
	
	// If the user spent money, put the order total
	if (currency == "USD")
		formattedAmount += ` $${amount}`;
	else
		formattedAmount += ` ${currency} ${amount}`;

	UpdateAlertBox(
		'fourthwall',
		'',
		`${user}`,
		`donated ${formattedAmount}`,
		'',
		user,
		message,
		fourthwallAlertAction,
		data
	);
}

function FourthwallSubscriptionPurchased(data) {
	if (!showFourthwallAlerts)
		return;

	// Set the text
	let user = data.nickname;
	const amount = data.amount;
	const currency = data.currency;
	
	let formattedAmount = '';
	
	// If the user spent money, put the order total
	if (currency == "USD")
		formattedAmount += ` ($${amount})`;
	else
		formattedAmount += ` (${currency} ${amount})`;

	UpdateAlertBox(
		'fourthwall',
		'',
		`${user}`,
		`subscribed ${formattedAmount}`,
		'',
		user,
		'',
		fourthwallAlertAction,
		data
	);
}

function FourthwallGiftPurchase(data) {
	console.log(data);
	if (!showFourthwallAlerts)
		return;

	// Set the text
	let user = data.username;
	const total = data.total;
	const currency = data.currency;
	const gifts = data.gifts.length;
	const itemName = data.offer.name;
	const itemImageUrl = data.offer.imageUrl;
	const message = DecodeHTMLString(data.statmessageus);

	let contents = '';
	let attributesText = '';

	// If there is more than one gifted item, display the number of gifts
	if (gifts > 1)
		contents += ` ${gifts} x `;

	// The name of the item to be given away
	contents += ` ${itemName}`;

	// If the user spent money, put the order total
	if (currency == "USD")
		attributesText = `$${total}`;
	else
		attributesText = `${currency}${total}`;

	UpdateAlertBox(
		'fourthwall',
		itemImageUrl,
		`${user}`,
		`gifted ${contents}`,
		attributesText,
		user,
		message,
		fourthwallAlertAction,
		data
	);
}

function FourthwallGiftDrawStarted(data) {
	if (!showFourthwallAlerts)
		return;

	// Set the text
	const durationSeconds = data.durationSeconds;
	const itemName = data.offer.name;

	UpdateAlertBox(
		'fourthwall',
		'',
		`<span style="font-size: 1.2em">🎁 ${itemName} Giveaway!</span>`,
		`Type !join in the next ${durationSeconds} seconds for your chance to win!`,
		'',
		'',
		'',
		fourthwallAlertAction,
		data
	);
}

function FourthwallGiftDrawEnded(data) {
	if (!showFourthwallAlerts)
		return;
	
	// Render avatars
	if (showAvatar) {
		avatar.src = '';
	}

	UpdateAlertBox(
		'fourthwall',
		`<span style="font-size: 1.2em">🥳 GIVEAWAY ENDED 🥳</span>`,
		`Congratulations ${GetWinnersList(data.gifts)}!`,
		'',
		'',
		'',
		fourthwallAlertAction,
		data
	);
}



//////////////////////
// HELPER FUNCTIONS //
//////////////////////

function GetBooleanParam(paramName, defaultValue) {
	const urlParams = new URLSearchParams(window.location.search);
	const paramValue = urlParams.get(paramName);

	if (paramValue === null) {
		return defaultValue; // Parameter not found
	}

	const lowercaseValue = paramValue.toLowerCase(); // Handle case-insensitivity

	if (lowercaseValue === 'true') {
		return true;
	} else if (lowercaseValue === 'false') {
		return false;
	} else {
		return paramValue; // Return original string if not 'true' or 'false'
	}
}

function GetIntParam(paramName, defaultValue) {
	const urlParams = new URLSearchParams(window.location.search);
	const paramValue = urlParams.get(paramName);

	if (paramValue === null) {
		return defaultValue; // or undefined, or a default value, depending on your needs
	}

	console.log(paramValue);

	const intValue = parseInt(paramValue, 10); // Parse as base 10 integer

	if (isNaN(intValue)) {
		return null; // or handle the error in another way, e.g., throw an error
	}

	return intValue;
}

async function GetAvatar(username) {
	if (avatarMap.has(username)) {
		console.debug(`Avatar found for ${username}. Retrieving from hash map.`)
		return avatarMap.get(username);
	}
	else {
		console.debug(`No avatar found for ${username}. Retrieving from Decapi.`)
		let response = await fetch('https://decapi.me/twitch/avatar/' + username);
		let data = await response.text()
		avatarMap.set(username, data);
		return data;
	}
}

function DecodeHTMLString(html) {
	var txt = document.createElement("textarea");
	txt.innerHTML = html;
	return txt.value;
}

// I used Gemini for this shit so if it doesn't work, blame Google
function FindFirstImageUrl(jsonObject) {
	if (typeof jsonObject !== 'object' || jsonObject === null) {
		return null; // Handle invalid input
	}

	function iterate(obj) {
		if (Array.isArray(obj)) {
			for (const item of obj) {
				const result = iterate(item);
				if (result) {
					return result;
				}
			}
			return null;
		}

		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (key === 'imageUrl') {
					return obj[key]; // Found it! Return the value.
				}

				if (typeof obj[key] === 'object' && obj[key] !== null) {
					const result = iterate(obj[key]); // Recursive call for nested objects
					if (result) {
						return result; // Propagate the found value
					}
				}
			}
		}
		return null; // Key not found in this level
	}

	return iterate(jsonObject);
}

function GetWinnersList(gifts) {
	const winners = gifts.map(gift => gift.winner);
	const numWinners = winners.length;

	if (numWinners === 0) {
		return "";
	} else if (numWinners === 1) {
		return winners[0];
	} else if (numWinners === 2) {
		return `${winners[0]} and ${winners[1]}`;
	} else {
		const lastWinner = winners.pop();
		const secondLastWinner = winners.pop();
		return `${winners.join(", ")}, ${secondLastWinner} and ${lastWinner}`;
	}
}

function UpdateAlertBox(platform, avatarURL, headerText, descriptionText, attributeText, username, message, sbAction, sbData) {
	// If the page is inactive (e.g. the alert browser source is on an inactive OBS scene)
	// don't run the alert
	if (document.visibilityState != 'visible')
	{
		console.debug('Tab is inactive. Skipping alert...');
		return;
	}

	// Check if the widget is in the middle of an animation
	// If any alerts are requested while the animation is playing, it should be added to the alert queue
	if (widgetLocked) {
		console.debug("Animation is progress, added alert to queue");
		let data = { platform: platform, avatarURL: avatarURL, headerText: headerText, descriptionText: descriptionText, attributeText: attributeText, username: username, message: message, sbAction: sbAction, sbData: sbData};
		alertQueue.push(data);
		return;
	}

	// Start the animation
	widgetLocked = true;

	// Set the card background colors
	alertBox.classList = '';
	if (useCustomBackground)
		alertBox.classList.add('customBackground');
	else
		alertBox.classList.add(platform);

	// Render avatars
	if (showAvatar) {
		avatarElement.src = avatarURL;
		avatarSmallElement.src = avatarURL;
	}

	// Set labels
	usernameLabel.innerHTML = headerText != null ? headerText : '';
	usernameTheSecondLabel.innerHTML = username != null ? username : '';
	descriptionLabel.innerHTML = descriptionText != null ? descriptionText : '';
	attributeLabel.innerHTML = attributeText != null ? attributeText : '';
	messageLabel.innerHTML = message != null ? `${message}` : '';
	theContentThatShowsLastInsteadOfFirst.style.opacity = 0;

	// Start animation
	theContentThatShowsFirstInsteadOfSecond.style.display = 'flex';
	alertBox.style.transition = 'all 0s ease-in-out';
	alertBox.style.height = theContentThatShowsFirstInsteadOfSecond.offsetHeight + "px";
	alertBox.style.animation = `${showAnimation} 0.5s ease-out forwards`;

	// Play sound effect
	if (playSounds) {
		const audio = new Audio('sfx/notification.mp3');
		audio.play();
	}

	// Add extra useful info to sbData
	if (!sbData)
		sbData = {};
	
	sbData.boxHeight1 = theContentThatShowsFirstInsteadOfSecond.offsetHeight;
	sbData.boxHeight2 = (message && showMesesages) ? theContentThatShowsLastInsteadOfFirst.offsetHeight : 0;
	sbData.alertDuration = hideAfter * 1000;

	console.log(sbData);

	// Run the Streamer.bot action if there is one
	if (globalShowAction) {
		console.debug('Running Streamer.bot action: ' + globalShowAction);
		client.doAction({name: globalShowAction}, sbData);
	}

	// Run the Streamer.bot action if there is one
	if (sbAction) {
		console.debug('Running Streamer.bot action: ' + sbAction);
		client.doAction({name: sbAction}, sbData);
	}

	// (1) Set timeout (8 seconds by default)
	// (2) Set the message label
	// (3) Calculate the height of message label
	// (4) Set the height of alertBox
	//		(a) Add in the CSS animation when this is working
	setTimeout(() => {
		alertBox.style.transition = 'all 0.5s ease-in-out';
		theContentThatShowsFirstInsteadOfSecond.style.opacity = 0;
		
		// For safety, if message doesn't exist, set it to empty string anyway
		if (!message)
			message = '';

		// If there is a message, show it in the second part of the animation
		// Else, just close the alert box and run the next alert
		if (message.trim().length > 0 && showMesesages) {
		
			//theContentThatShowsLastInsteadOfFirst.style.display = 'inline-block';
			theContentThatShowsLastInsteadOfFirst.style.visibility = 'visible';
			alertBox.style.height = theContentThatShowsLastInsteadOfFirst.offsetHeight + "px";
			theContentThatShowsLastInsteadOfFirst.style.opacity = 1;
			
			setTimeout(() => {
				// Run the Streamer.bot action if there is one
				if (globalHideAction) {
					console.debug('Running Streamer.bot action: ' + globalHideAction);
					client.doAction({name: globalHideAction}, sbData);
				}

				alertBox.style.animation = `${hideAnimation} 0.5s ease-out forwards`;
	
				setTimeout(() => {
					alertBox.style.height = '0px';
					theContentThatShowsFirstInsteadOfSecond.style.opacity = 1;
					theContentThatShowsLastInsteadOfFirst.style.opacity = 0;
					//theContentThatShowsLastInsteadOfFirst.style.display = 'none';
					theContentThatShowsLastInsteadOfFirst.style.visibility = 'hidden';
					widgetLocked = false;
					if (alertQueue.length > 0) {
						console.debug("Pulling next alert from the queue");
						let data = alertQueue.shift();
						UpdateAlertBox(data.platform, data.avatarURL, data.headerText, data.descriptionText, data.attributeText, data.username, data.message, data.sbAction, data.sbData);
					}
				}, 1000);
			}, hideAfter * 1000);	
		} else {
			// Run the Streamer.bot action if there is one
			if (globalHideAction) {
				console.debug('Running Streamer.bot action: ' + globalHideAction);
				client.doAction({name: globalHideAction}, sbData);
			}

			alertBox.style.animation = `${hideAnimation} 0.5s ease-out forwards`;

			setTimeout(() => {
				alertBox.style.height = '0px';
				
				theContentThatShowsFirstInsteadOfSecond.style.opacity = 1;
				theContentThatShowsLastInsteadOfFirst.style.opacity = 0;
				//theContentThatShowsLastInsteadOfFirst.style.display = 'none';
				theContentThatShowsLastInsteadOfFirst.style.visibility = 'hidden';
				widgetLocked = false;
				if (alertQueue.length > 0) {
					console.debug("Pulling next alert from the queue");
					let data = alertQueue.shift();
					UpdateAlertBox(data.platform, data.avatarURL, data.headerText, data.descriptionText, data.attributeText, data.username, data.message, data.sbAction, data.sbData);
				}
			}, 1000);
		}

	}, hideAfter * 1000);

}

////////////////////
// TEST FUNCTIONS //
////////////////////

async function testWidget()
{
	UpdateAlertBox(
		'twitch',
		await GetAvatar('nutty'),
		`nutty`,
		`subscribed with Tier 3`,
		'',
		`nutty`,
		`O-oooooooooo AAAAE-A-A-I-A-U- JO-oooooooooooo AAE-O-A-A-U-U-A- E-eee-ee-eee AAAAE-A-E-I-E-A-JO-ooo-oo-oo-oo EEEEO-A-AAA-AAAA`
		//``
	);
}


///////////////////////////////////
// STREAMER.BOT WEBSOCKET STATUS //
///////////////////////////////////

// This function sets the visibility of the Streamer.bot status label on the overlay
function SetConnectionStatus(connected) {
	let statusContainer = document.getElementById("statusContainer");
	if (connected) {
		statusContainer.style.background = "#2FB774";
		statusContainer.innerText = "Connected!";
		statusContainer.style.opacity = 1;
		setTimeout(() => {
			statusContainer.style.transition = "all 2s ease";
			statusContainer.style.opacity = 0;
		}, 10);
	}
	else {
		statusContainer.style.background = "#D12025";
		statusContainer.innerText = "Connecting...";
		statusContainer.style.transition = "";
		statusContainer.style.opacity = 1;
	}
}

// let data = {
// 	cumulative_total: 77,
// 	id: "6616253944106387595",
// 	isTest: false,
// 	messageId: "00e4258c-a880-4f11-a93c-4734ee92199f",
// 	recipients: [
// 	  {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
// 	],
// 	sub_tier: "1000", // Usually "1000" = Tier 1
// 	systemMessage: "thetrickster1973 is gifting 10 Tier 1 Subs to nutty's community! They've gifted a total of 77 in the channel!",
// 	total: 10,
// 	user: {
// 	  badges: [{}, {}, {}],
// 	  color: "#1E90FF",
// 	  id: "52175891",
// 	  login: "thetrickster1973",
// 	  monthsSubscribed: 14,
// 	  name: "thetrickster1973",
// 	  role: 2, // 2 - VIP
// 	  subscribed: true,
// 	  type: "twitch"
// 	}
//   };

// TwitchGiftBomb(data);

//testWidget();