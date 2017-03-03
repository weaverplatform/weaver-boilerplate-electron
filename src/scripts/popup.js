(function() {
	'use strict';

	var Popup = function(type, message, timeout) {
		this.type = type || this.types.default;
		this.message = message || "";
		this.timeout = timeout || 5000;
	}

	Popup.prototype.show = function() {
		$('.notification-container').append(
			'<div class="notification is-' + this.type + '">' +
			this.message +
			'</div>'
		);

		setTimeout(function() {
			$('.notification-container').children(':first').remove();
		}, this.timeout);
	}

	Popup.prototype.setType = function(type) {
		this.type = type;
	}

	Popup.prototype.setMessage = function (message) {
		this.message = message;
	}

	module.exports = Popup;
	module.exports.Types = {
		default: 'default',
		success: 'success',
		warning: 'warning',
		error: 'danger',
	}

})();
