const sanitizeHtml = require('sanitize-html');

const allowedTags = [
    'a',
    'b',
    'blockquote',
    'br',
    'caption',
    'code',
    'col',
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'i',
    'img',
    'li',
    'ol',
    'p',
    'pre',
    'q',
    's',
    'small',
    'span',
    'strike',
    'strong',
    'sub',
    'sup',
    'ul',
    'iframe',
    'figcaption',
    'figure'
];

const allowedAttributes = {
    a: ['href', 'title'],
    img: ['src'],
    iframe: ['src']
};

module.exports = (html) => {
    return sanitizeHtml(html, {
        allowedTags,
        allowedAttributes,
        allowedSchemes: ['http', 'https', 'mailto'],
        allowedSchemesByTag: {},
        allowedSchemesAppliedToAttributes: ['href', 'src'],
        allowProtocolRelative: false,
        allowedIframeHostnames: ['www.youtube.com']
    });
};