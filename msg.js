/**
 * Project: NIMORA MD - Message Parser
 * Creator: Nimsara
 */

/**
 * Extract text body from a Baileys message
 */
function getMessageBody(msg) {
    if (!msg || !msg.message) return '';
    let message = msg.message;

    // Unwrap nested message types
    if (message.ephemeralMessage) message = message.ephemeralMessage.message;
    if (message.viewOnceMessage) message = message.viewOnceMessage.message;
    if (message.viewOnceMessageV2) message = message.viewOnceMessageV2.message;
    if (message.documentWithCaptionMessage) message = message.documentWithCaptionMessage.message;

    return (
        message.conversation ||
        message.extendedTextMessage?.text ||
        message.imageMessage?.caption ||
        message.videoMessage?.caption ||
        message.documentMessage?.caption ||
        ''
    );
}

/**
 * Unwrap any nested message wrappers
 */
function unwrapMessage(message) {
    if (!message) return null;

    while (
        message.ephemeralMessage ||
        message.viewOnceMessage ||
        message.viewOnceMessageV2 ||
        message.viewOnceMessageV2Extension ||
        message.documentWithCaptionMessage
    ) {
        if (message.ephemeralMessage) message = message.ephemeralMessage.message;
        else if (message.viewOnceMessage) message = message.viewOnceMessage.message;
        else if (message.viewOnceMessageV2) message = message.viewOnceMessageV2.message;
        else if (message.viewOnceMessageV2Extension) message = message.viewOnceMessageV2Extension.message;
        else if (message.documentWithCaptionMessage) message = message.documentWithCaptionMessage.message;
    }

    return message;
}

/**
 * Detect media type in a message
 */
function getMediaType(message) {
    if (!message) return null;
    const unwrapped = unwrapMessage(message);
    if (!unwrapped) return null;

    const types = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'];
    for (const type of types) {
        if (unwrapped[type]) return { type, data: unwrapped[type] };
    }
    return null;
}

/**
 * Legacy export (compatible with older code)
 */
module.exports = {
    parseMessage: (msg) => {
        if (!msg.message) return '';
        return (
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            ''
        );
    },
    getMessageBody,
    unwrapMessage,
    getMediaType
};
