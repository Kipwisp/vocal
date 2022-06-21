class Notifications {
	notifyError(member) {
		return `${member} Sorry, your request failed. Try again.`;
	}

	notifyProcessing(member) {
		return `${member} Hold on, this might take a bit...`;
	}

	notifySizeLimitExceeded(member) {
		return `${member} Sorry, the selected messages may result in a file that is too large to send.`;
	}

	notifyInvalidInputMessage(member) {
		return `${member} Sorry, one of the selected messages contains invalid input.`;
	}

	notifyRequestQueued(member, character, emotions, line) {
		return `${member} Queued your request: [${character} - ${emotions}] ${line}`;
	}

	notifyInvalidCharacterCode(member, prefix) {
		return `${member} That character code is invalid. Say ${prefix}help to view valid codes.`;
	}

	notifyCharLimitExceeded(member, difference, charLimit) {
		return `${member} Your message is ${difference} character${difference === 1 ? '' : 's'} over the character limit (${charLimit} characters max).`;
	}

	notifyActivity(prefix) {
		return `${prefix}help | Powered by 15.ai | v${process.env.npm_package_version}`;
	}
}

const notifications = new Notifications();

module.exports = notifications;
