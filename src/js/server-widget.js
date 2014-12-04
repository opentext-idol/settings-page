 define([
    'settings/js/widget',
    'text!settings/templates/server-widget.html'
], function(Widget, template) {

    return Widget.extend({
        className: Widget.prototype.className + ' settings-servergroup control-group form-horizontal',

        successClass: 'success',
        errorClass: 'error',
        formControlClass: '',

        serverTemplate: _.template(template),

        events: _.extend({
            'click button[name=validate]': 'triggerValidation'
        }, Widget.prototype.events),

        render: function() {
            Widget.prototype.render.call(this);

            this.$content.append(this.serverTemplate({
                strings: this.strings
            }));

            this.$connectionState = this.$('.settings-server-validation');
        },

        handleInputChange: function() {
            Widget.prototype.handleInputChange.apply(this, arguments);

            if (!_.isUndefined(this.lastValidation) && _.isEqual(this.lastValidationConfig, this.getConfig())) {
                this.setValidationFormatting(this.lastValidation ? this.successClass : this.errorClass);
            }
        },

        handleValidation: function(config, response) {
            if (_.isEqual(config, this.lastValidationConfig)) {
                this.lastValidation = response.valid;
                this.hideValidationInfo();

                this.displayValidationMessage(_.isEqual(this.getConfig(), config), response);
            }
        },

        displayValidationMessage: function(isEqual, response) {
            if (isEqual) {
                this.setValidationFormatting(this.lastValidation ? this.successClass : this.errorClass);

                var message;

                if (this.lastValidation) {
                    message = this.getValidationSuccessMessage(response);
                }
                else {
                    message = this.getValidationFailureMessage(response);
                }

                this.$('.settings-server-validation').text(message)
                    .stop()
                    .animate({opacity: 1});
            } else {
                this.setValidationFormatting('clear');
            }
        },

        getValidationSuccessMessage: function(/*response*/) {
            return this.strings.validateSuccess;
        },

        getValidationFailureMessage: function(response) {
            return response.data || this.strings.validateFailed;
        },

        hideValidationInfo: function() {
            Widget.prototype.hideValidationInfo.apply(this, arguments);
            this.$connectionState.text('').css({opacity: 0}).stop();
        },

        shouldValidate: function() {
            return true;
        },

        triggerValidation: function() {
            this.setValidationFormatting('clear');
            this.hideValidationInfo();

            if (this.validateInputs()) {
                this.trigger('validate');
            }
        },

        updateConfig: function() {
            Widget.prototype.updateConfig.apply(this, arguments);
            delete this.lastValidation;
            delete this.lastValidationConfig;
        }
    });

});
