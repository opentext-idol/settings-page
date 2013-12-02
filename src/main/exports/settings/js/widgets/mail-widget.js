define([
    'settings/js/server-widget',
    'settings/js/controls/password-view',
    'settings/js/controls/enable-view',
    'text!settings/templates/widgets/mail-widget.html'
], function(ServerWidget, PasswordView, EnableView, template) {

    var defaultPorts = {
        NONE: 25,
        STARTTLS: 587,
        TLS: 465
    };

    template = _.template(template);

    return ServerWidget.extend({
        className: ServerWidget.prototype.className,

        events: _.extend({
            'change select[name=connection-security]': 'handleSecurityChange'
        }, ServerWidget.prototype.events),

        initialize: function(options) {
            ServerWidget.prototype.initialize.call(this, options);
            _.bindAll(this, 'handleSecurityChange', 'updateAuthState');

            this.passwordView = new PasswordView({
                enabled: false,
                strings: this.strings
            });

            this.enableView = new EnableView({
                enableIcon: 'icon-envelope',
                strings: this.strings
            });

            this.securityTypes = options.securityTypes;
        },

        render: function() {
            ServerWidget.prototype.render.call(this);

            var $validateButtonParent = this.$('button[name=validate]').parent();

            $validateButtonParent.before(template({
                securityTypes: this.securityTypes,
                strings: this.strings
            }));

            this.$authCheckbox = this.$('input[type="checkbox"]');
            this.$from = this.$('input[name=from]');
            this.$connectionSecurity = this.$('select[name=connection-security]');
            this.$host = this.$('input[name=host]');
            this.$port = this.$('input[name=port]');
            this.$to = this.$('input[name=to]');
            this.$username = this.$('input[name=username]');

            this.passwordView.render();
            $validateButtonParent.before(this.passwordView.$el);
            this.enableView.render();
            $validateButtonParent.before(this.enableView.$el);
        },

        getConfig: function() {
            var authenticationRequired = this.$authCheckbox.prop('checked');

            var baseConfig = {
                connectionSecurity: this.$connectionSecurity.val(),
                enabled: this.enableView.getConfig(),
                from: this.$from.val(),
                host: this.$host.val(),
                port: Number(this.$port.val()),
                to: _.compact(_.map(this.$to.val().split(','), function (val) {
                    return $.trim(val);
                }))
            };

            if(authenticationRequired) {
                return _.extend(baseConfig, this.passwordView.getConfig(), {username: this.$username.val()});
            }
            else {
                return baseConfig
            }
        },

        handleInputChange: function(evt) {
            ServerWidget.prototype.handleInputChange.apply(this, arguments);
            var $input = $(evt.target);
            var authRequired = this.$authCheckbox.prop('checked');

            if ($input.is(this.$authCheckbox)) {
                this.updateAuthState(authRequired);
            }
        },

        handleSecurityChange: function() {
            var newSecurityType = this.$connectionSecurity.val();

            if (Number(this.$port.val()) === defaultPorts[this.lastSecurityType]) {
                this.$port.val(defaultPorts[newSecurityType]);
            }

            this.lastSecurityType = newSecurityType;
        },

        updateAuthState: function(authRequired) {
            this.$authCheckbox.prop('checked', authRequired);
            this.$username.prop('disabled', !authRequired);
            this.$username.siblings('.settings-required-flag').toggleClass('hide', !authRequired);
            this.passwordView.setEnabled(authRequired);
        },

        shouldValidate: function() {
            return this.enableView.getConfig();
        },

        updateConfig: function(config) {
            ServerWidget.prototype.updateConfig.apply(this, arguments);

            this.$connectionSecurity.val(config.connectionSecurity);
            this.$from.val(config.from);
            this.$host.val(config.host);
            this.$port.val(config.port);
            this.$to.val(config.to ? config.to.join(',') : '');
            this.$username.val(config.username);

            this.enableView.updateConfig(config.enabled);
            this.passwordView.updateConfig(config);
            this.lastSecurityType = config.connectionSecurity;
            this.updateAuthState(config.username !== '' || this.$authCheckbox.prop('checked'));
        },

        validateInputs: function() {
            var isValid = true;
            var config = this.getConfig();

            if (config.host === '') {
                isValid = false;
                this.updateInputValidation(this.$host);
            }

            if (config.from === '') {
                isValid = false;
                this.updateInputValidation(this.$from);
            }

            if (!config.to.length) {
                isValid = false;
                this.updateInputValidation(this.$to);
            }

            if (this.$authCheckbox.prop('checked')) {
                if (!this.passwordView.validateInputs()) {
                    isValid = false;
                }

                if (config.username === '') {
                    isValid = false;
                    this.updateInputValidation(this.$username);
                }
            }

            return isValid;
        }
    });

});
