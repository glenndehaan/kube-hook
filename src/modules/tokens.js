/**
 * Define env variables
 */
const tokens = process.env.TOKENS || '';

/**
 * Exports all available tokens
 */
module.exports = () => {
    const parsedTokens = {};

    tokens.split(',').forEach((token) => {
        const splitToken = token.split(':');
        if(splitToken[0]) {
            parsedTokens[splitToken[0]] = `Bearer ${splitToken[1]}`;
        }
    });

    return parsedTokens;
};
