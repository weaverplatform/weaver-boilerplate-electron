(function() {
	'use strict';

	var EventEmitter = require('events').EventEmitter;

	var StepRouter = function() {
		this.currentStep = 1;
		$('#content').load('./src/html/step1.html').hide().fadeIn('slow');
	};

	StepRouter.prototype = Object.create( EventEmitter.prototype );

	StepRouter.prototype.next = function () {
		this.goto(this.currentStep + 1);
	}

	StepRouter.prototype.prev = function () {
		this.goto(this.currentStep - 1);
	}

	StepRouter.prototype.goto = function(step) {
		if(step === this.currentStep) return;
		this.currentStep = step;
		$('#menu').children('li').each(function() {
			$(this).removeClass('active');
		})
		$('#step-' + step).parent().addClass('active');
		$('#content').load('src/html/step' + step + '.html').hide().fadeIn('slow');
		this.emit('step change', this.currentStep);
	}

	var stepRouter = new StepRouter();
	module.exports = stepRouter;

})();
