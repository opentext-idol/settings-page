define([
    'backbone',
    'settings/js/widget',
    'text!settings/templates/server-widget.html'
], function(Backbone, Widget, template) {

    template = _.template(template);

    return Widget.extend({
        className: Widget.prototype.className + ' settings-servergroup control-group form-horizontal',

        events: {
            'change input,select': 'handleInputChange',
            'click button[name=validate]': 'triggerValidation'
        },

        initialize: function(options) {
            Widget.prototype.initialize.call(this, options);

            _.bindAll(this, 'hideConnectionInfo', 'handleInputChange', 'handleValidation', 'setValidationFormatting', 'shouldValidate',
                'triggerValidation', 'validateInputs');
        },

        render: function() {
            Widget.prototype.render.call(this);
            this.$el.append(template({strings: this.strings}));
            this.$connectionState = this.$('.settings-server-validation');
        },

        handleInputChange: function() {
            this.hideConnectionInfo();

            if (!_.isUndefined(this.lastValidation) && _.isEqual(this.lastValidationConfig, this.getConfig())) {
                this.setValidationFormatting(this.lastValidation ? 'success' : 'error');
            } else {
                this.setValidationFormatting('clear');
            }
        },

        handleValidation: function(config, response) {
            if (_.isEqual(config, this.lastValidationConfig)) {
                this.lastValidation = response.valid;
                this.hideConnectionInfo();

                this.displayValidationMessage(_.isEqual(this.getConfig(), config), response)
            }
        },

        displayValidationMessage: function(isEqual, response) {
            if (isEqual) {
                this.setValidationFormatting(this.lastValidation ? 'success' : 'error');

                var $validation = this.$('.settings-server-validation').text(this.lastValidation ? this.strings.validateSuccess : (response.data || this.strings.validateFailed))
                    .stop()
                    .animate({opacity: 1});

                if (this.lastValidation) {
                    $validation.delay(1000).animate({opacity: 0}, 1000);
                }
            } else {
                this.setValidationFormatting('clear');
            }
        },

        hideConnectionInfo: function() {
            this.$connectionState.text('').css({opacity: 0}).stop();
            this.$('.settings-client-validation').addClass('hide');
        },

        setValidationFormatting: function(state) {
            this.$el.find('.control-group').removeClass('success error');

            if (state === 'clear') {
                this.$el.removeClass('success error');
            } else {
                this.$el.addClass(state)
                    .removeClass(state === 'success' ? 'error' : 'success');
            }
        },

        shouldValidate: function() {
            return true;
        },

        triggerValidation: function() {
            this.setValidationFormatting('clear');
            this.hideConnectionInfo();

            if (this.validateInputs()) {
                this.trigger('validate');
            }
        },

        updateConfig: function() {
            delete this.lastValidation;
            delete this.lastValidationConfig;
            this.setValidationFormatting('clear');
            this.hideConnectionInfo();
        },

        updateInputValidation: function($input, isValid) {
            var $controlGroup = $input.parent();
            var $span = $controlGroup.find('.settings-client-validation');

            if (isValid) {
                $controlGroup.removeClass('error');
                $span.addClass('hide');
            } else {
                $controlGroup.addClass('error');
                $span.removeClass('hide');
            }
        },

        // Override to add client side validation.
        validateInputs: function() {
            return true;
        }
    });

});
