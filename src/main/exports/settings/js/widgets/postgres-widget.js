define([
    'settings/js/server-widget',
    'settings/js/controls/password-view',
    'settings/js/controls/enable-view',
    'text!settings/templates/widgets/postgres-widget.html'
], function(ServerWidget, PasswordView, EnableView, template) {

    template = _.template(template);

    return ServerWidget.extend({
        className: ServerWidget.prototype.className,

        initialize: function(options) {
            ServerWidget.prototype.initialize.call(this, options);
            this.passwordView = new PasswordView({strings: this.strings});

            if (options.canDisable) {
                this.enableView = new EnableView({enableIcon: 'icon-file', strings: this.strings});
            }
        },

        render: function() {
            ServerWidget.prototype.render.call(this);

            var $validateButtonParent = this.$('button[name=validate]').parent();
            $validateButtonParent.before(template({strings: this.strings}));

            this.$database = this.$('input[name=database]');
            this.$databaseCheckbox = this.$('input[type="checkbox"]');
            this.$host = this.$('input[name=host]');
            this.$port = this.$('input[name=port]');
            this.$username = this.$('input[name=username]');

            this.passwordView.render();
            this.$databaseCheckbox.parent().before(this.passwordView.$el);

            if (this.enableView) {
                this.enableView.render();
                $validateButtonParent.before(this.enableView.$el);
            }
        },

        getConfig: function() {
            var config = _.extend({
                database: this.$databaseCheckbox.prop('checked') ? this.$username.val() : this.$database.val(),
                host: this.$host.val(),
                port: Number(this.$port.val()),
                username: this.$username.val()
            }, this.passwordView.getConfig());

            if (this.enableView) {
                _.extend(config, {
                    enabled: this.enableView.getConfig()
                });
            }

            return config;
        },

        handleInputChange: function(evt) {
            ServerWidget.prototype.handleInputChange.apply(this, arguments);
            var $input = $(evt.target);

            if ($input.is(this.$databaseCheckbox)) {
                this.$database.prop('disabled', this.$databaseCheckbox.prop('checked'));
            }

            if (this.$databaseCheckbox.prop('checked') && ($input.is(this.$databaseCheckbox) || $input.is(this.$username))) {
                this.$database.val(this.$username.val());
            }
        },

        shouldValidate: function() {
            if (this.enableView) {
                return this.enableView.getConfig();
            }

            return true;
        },

        updateConfig: function(config) {
            ServerWidget.prototype.updateConfig.apply(this, arguments);

            this.$database.val(config.database);
            this.$host.val(config.host);
            this.$port.val(config.port);
            this.$username.val(config.username);
            this.passwordView.updateConfig(config);

            if (this.enableView) {
                this.enableView.updateConfig(config.enabled);
            }

            if (config.database === '' && config.username !== '') {
                this.$database.val(config.username);
            }

            var checkboxState = this.$database.val() === this.$username.val();
            this.$databaseCheckbox.prop('checked', checkboxState);
            this.$database.prop('disabled', checkboxState);
        },

        validateInputs: function() {
            var isValid = true;

            if (this.shouldValidate()) {
                var config = this.getConfig();

                if (config.host === '') {
                    isValid = false;
                    this.updateInputValidation(this.$host);
                }

                if (config.username === '') {
                    isValid = false;
                    this.updateInputValidation(this.$username);
                }

                if (config.database === '') {
                    isValid = false;
                    this.updateInputValidation(this.$database);
                }

                isValid = isValid && this.passwordView.validateInputs();
            }

            return isValid;
        }
    });

});
