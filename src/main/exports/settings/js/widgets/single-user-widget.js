define([
    'settings/js/widget',
    'text!settings/templates/widgets/single-user-widget.html'
], function(Widget, template) {

    template = _.template(template);

    return Widget.extend({

        className: Widget.prototype.className + ' form-horizontal',

        render: function() {
            Widget.prototype.render.call(this);

            this.$content.append(template({
                strings: this.strings
            }));

            this.$username = this.$('input[name="username"]');
            this.$currentPassword = this.$('input[name="currentPassword"]');
            this.$newPassword = this.$('input[name="newPassword"]');
            this.$confirmPassword = this.$('input[name="confirmPassword"]');
        },

        getConfig: function() {
            return {
                method: 'singleUser',
                singleUser: {
                    username: this.$username.val(),
                    currentPassword: this.$currentPassword.val(),
                    plaintextPassword: this.$newPassword.val()
                }
            }
        },

        updateConfig: function(config) {
            Widget.prototype.updateConfig.apply(this, arguments);

            this.$username.val(config.singleUser.username);
        },

        validateInputs: function() {
            var isValid = true;

            _.each([this.$username, this.$currentPassword, this.$newPassword, this.$confirmPassword], function($input) {
                if(!$input.val()) {
                    isValid = false;

                    this.updateInputValidation($input, false);
                }
            }, this);

            if(this.$newPassword.val() !== this.$confirmPassword.val()) {
                isValid = false;
                this.updateInputValidation(this.$newPassword, false);
                this.updateInputValidation(this.$confirmPassword, false);
            }

            return isValid;
        }

    });

});