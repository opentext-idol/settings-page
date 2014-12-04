define([
    'settings/js/widget',
    'settings/js/controls/password-view',
    'text!settings/templates/widgets/single-user-widget.html'
], function(Widget, PasswordView, template) {

    template = _.template(template);

    return Widget.extend({

        className: Widget.prototype.className + ' form-horizontal',

        initialize: function() {
            Widget.prototype.initialize.apply(this, arguments);

            this.currentPassword = new PasswordView({
                strings: {
                    passwordLabel: this.strings.currentPassword,
                    passwordRedacted: this.strings.passwordRedacted,
                    validatePasswordBlank: this.strings.validateCurrentPasswordBlank
                }
            });

            this.newPassword = new PasswordView({
                strings: {
                    passwordLabel: this.strings.newPassword,
                    passwordRedacted: this.strings.passwordRedacted,
                    validatePasswordBlank: this.strings.validateNewPasswordBlank
                }
            });

            this.confirmPassword = new PasswordView({
                strings: {
                    passwordLabel: this.strings.confirmPassword,
                    passwordRedacted: this.strings.passwordRedacted,
                    validatePasswordBlank: this.strings.validateConfirmPasswordBlank
                }
            });

            this.passwordViews = [
                this.currentPassword,
                this.newPassword,
                this.confirmPassword
            ];
        },

        render: function() {
            Widget.prototype.render.call(this);

            this.$content.append(template({
                strings: this.strings
            }));

            _.each(this.passwordViews, function(view) {
                view.render();

                this.$('.passwords').append(view.el);
            }, this);

            this.$('.settings-label').addClass('single-user-settings-label');

            this.$username = this.$('input[name="username"]');
        },

        getConfig: function() {
            var passwordRedacted = _.every(this.passwordViews, function(view) {
                return view.getConfig().passwordRedacted
            });

            return {
                method: 'singleUser',
                singleUser: {
                    currentPassword: this.currentPassword.getConfig().password,
                    passwordRedacted: passwordRedacted,
                    plaintextPassword: this.newPassword.getConfig().password,
                    username: this.$username.val()
                }
            }
        },

        updateConfig: function(config) {
            Widget.prototype.updateConfig.apply(this, arguments);

            var singleUser = config.singleUser;

            this.$username.val(singleUser.username);

            _.invoke(this.passwordViews, 'updateConfig', {password: null, passwordRedacted: singleUser.passwordRedacted});
        },

        validateInputs: function() {
            var isValid = true;

            if(!this.$username.val()) {
                isValid = false;

                this.updateInputValidation(this.$username, false);
            }

            _.each(this.passwordViews, function(view) {
                // validate inputs first for better error handling
                isValid = view.validateInputs() && isValid;
            });

            var currentPasswordConfig = this.currentPassword.getConfig();
            var newPasswordConfig = this.newPassword.getConfig();
            var confirmPasswordConfig = this.confirmPassword.getConfig();

            // if any password has been modified, inequality means invalidation
            if((!currentPasswordConfig.isRedacted || !newPasswordConfig.isRedacted || !confirmPasswordConfig.isRedacted) &&
                    newPasswordConfig.password !== confirmPasswordConfig.password) {
                isValid = false;
                this.$('.password-mismatch').removeClass('hide');
            }

            return isValid;
        }

    });

});