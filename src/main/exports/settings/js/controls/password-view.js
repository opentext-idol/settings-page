define([
    'backbone',
    'text!settings/templates/controls/password-view.html'
], function(Backbone, template) {

    template = _.template(template);

    return Backbone.View.extend({
        className: 'control-group',

        events: {
            'change input': 'handleInputChange'
        },

        initialize: function(options) {
            _.bindAll(this, 'getConfig', 'updateConfig');
            this.enabled = !_.isUndefined(options.enabled) ? options.enabled : true;
            this.strings = options.strings;
        },

        render: function() {
            this.$el.html(template({
                enabled: this.enabled,
                strings: this.strings
            }));

            this.$input = this.$('input[name="password"]').prop('disabled', !this.enabled);
            this.$required = this.$('.settings-required-flag').toggleClass('hide', !this.enabled);
        },

        getConfig: function() {
            return {
                password: this.$input.val(),
                passwordRedacted: this.isRedacted
            };
        },

        handleInputChange: function() {
            this.$el.removeClass('success, error');
            this.$('.settings-client-validation').addClass('hide');
        },

        setEnabled: function(state) {
            this.enabled = state;
            this.$input.prop('disabled', !state);
            this.$required.toggleClass('hide', !state);
        },

        updateConfig: function(config) {
            this.$input.val(config.password);
            this.isRedacted = config.passwordRedacted;

            if (this.isRedacted) {
                this.$input.on('change keyup', _.bind(function onPasswordChange(evt) {
                    if (evt.type === 'keyup' && this.redactedPassword && this.redactedPassword === this.$input.val()) {
                        return;
                    }

                    this.isRedacted = false;

                    this.$input.attr('placeholder', '').removeClass('placeholder')
                        .off('change keyup', onPasswordChange);
                }, this));

                if ('placeholder' in this.$input[0]) {
                    this.$input.attr('placeholder', this.strings.passwordRedacted);
                }
                else {
                    // browser doesn't support placeholders, e.g. IE <= 9
                    this.$input.val(this.strings.passwordRedacted).addClass('placeholder');
                }

                this.redactedPassword = this.$input.val();
            }
        },

        validateInputs: function() {
            if (this.enabled && !this.isRedacted && this.$input.val() === '') {
                this.$el.addClass('error');
                this.$('.settings-client-validation').removeClass('hide');
                return false;
            }

            return true;
        }
    });

});
