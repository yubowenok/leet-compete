/** @type {!Object<string, (number|string)>} */
var messageCss = {
  padding: '4px 16px'
};

/**
 * Displays a red error message before the leet-compete code block.
 * @param {string} text
 */
function error(text) {
  console.error(text);
  $('<div class="leet-compete-error"></div>')
    .addClass('leet-compete-error alert alert-danger')
    .text('[LeetCompete] ' + text)
    .css(messageCss)
    .appendTo('.question-content');
}

/**
 * Displays a yellow warning message before the leet-compete code block.
 * The message automatically fades out after 1 second.
 * @param {string} text
 */
function message(text) {
  var msg = $('<div></div>').addClass('alert alert-warning')
    .text('[LeetCompete] ' + text)
    .css(messageCss)
    .insertAfter('#leet-compete-code');
  // Auto fade out
  setTimeout(function() {
    msg.slideUp();
  }, 1000);
}
