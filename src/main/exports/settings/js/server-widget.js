define([
    'backbone',
    'settings/js/widget',
    'text!settings/templates/server-widget.html'
], function(Backbone, Widget, template) {

    template = _.template(template);

    return Widget.extend({
        className: Widget.prototype.className + ' settings-servergroup control-group form-horizontal',

        events: _.extend({
            'click button[name=validate]': 'triggerValidation'
        }, Widget.prototype.events),

        render: function() {
            Widget.prototype.render.call(this);
            this.$el.append(template({strings: this.strings}));
            this.$connectionState = this.$('.settings-server-validation');
        },

        handleInputChange: function() {
            Widget.prototype.handleInputChange.apply(this, arguments);

            if (!_.isUndefined(this.lastValidation) && _.isEqual(this.lastValidationConfig, this.getConfig())) {
                this.setValidationFormatting(this.lastValidation ? 'success' : 'error');
            }
        },

        handleValidation: function(config, response) {
            if (_.isEqual(config, this.lastValidationConfig)) {
                this.lastValidation = response.valid;
                this.hideValidationInfo();

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
