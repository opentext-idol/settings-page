define([
    'settings/js/widget',
    'settings/js/controls/enable-view',
    'text!settings/templates/widgets/logging-widget.html'
], function(Widget, EnableView, template) {

    var templateFunction = _.template(template);

    return Widget.extend({
        initialize: function() {
            Widget.prototype.initialize.apply(this, arguments);

            this.syslogToggle = new EnableView({
                enableIcon: 'icon-' + this.strings.iconClass,
                strings: this.strings.syslogToggle
            });
        },

        render: function() {
            Widget.prototype.render.apply(this, arguments);

            this.$content.append(templateFunction({strings: this.strings}));
            this.$syslogHost = this.$('[name="syslog-host"]');
            this.$syslogPort = this.$('[name="syslog-port"]');

            this.syslogToggle.render();
            this.$content.append(this.syslogToggle.$el);
        },

        getConfig: function() {
            return {
                enableFile: this.enableFile,
                enableSyslog: this.syslogToggle.getConfig(),
                syslogHost: this.$syslogHost.val(),
                syslogPort: this.$syslogPort.val()
            };
        },

        updateConfig: function(config) {
            Widget.prototype.updateConfig.apply(this, arguments);
            this.enableFile = config.enableFile;
            this.$syslogHost.val(config.syslogHost);
            this.$syslogPort.val(config.syslogPort);
            this.syslogToggle.updateConfig(config.enableSyslog);
        },

        validateInputs: function() {
            if (this.syslogToggle.getConfig()) {
                if ($.trim(this.$syslogHost.val()) === '') {
                    this.updateInputValidation(this.$syslogHost);
                    return false;
                }

                if (this.$syslogPort.val() <= 0 || this.$syslogPort.val() >= 65536) {
                    this.updateInputValidation(this.$syslogPort);
                    return false;
                }
            }

            return true;
        }
    });

});