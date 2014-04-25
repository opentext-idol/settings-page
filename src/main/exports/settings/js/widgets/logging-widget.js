define([
    'settings/js/widget',
    'settings/js/controls/enable-view',
    'text!settings/templates/widgets/logging-widget.html'
], function(Widget, EnableView, template) {

    var templateFunction = _.template(template);

    return Widget.extend({
        initialize: function() {
            Widget.prototype.initialize.apply(this, arguments);

            this.logFileToggle = new EnableView({
                enableIcon: 'icon-file-text',
                strings: this.strings.logFileToggle
            });

            this.syslogToggle = new EnableView({
                enableIcon: 'icon-' + this.strings.iconClass,
                strings: this.strings.syslogToggle
            });
        },

        render: function() {
            Widget.prototype.render.apply(this, arguments);

            this.$content.append(templateFunction({strings: this.strings}));
            this.$compression = this.$('[name="file-compression"]');
            this.$syslogHost = this.$('[name="syslog-host"]');
            this.$syslogPort = this.$('[name="syslog-port"]');

            this.logFileToggle.setElement(this.$('.logfile-toggle')).render();
            this.syslogToggle.setElement(this.$('.syslog-toggle')).render();
        },

        getConfig: function() {
            return {
                logFile: {
                    compression: this.$compression.val(),
                    enabled: this.logFileToggle.getConfig()
                },
                syslog: {
                    enabled: this.syslogToggle.getConfig(),
                    host: this.$syslogHost.val(),
                    port: this.$syslogPort.val()
                }
            };
        },

        updateConfig: function(config) {
            Widget.prototype.updateConfig.apply(this, arguments);

            this.$compression.val(config.logFile.compression);
            this.logFileToggle.updateConfig(config.logFile.enabled);

            this.$syslogHost.val(config.syslog.host);
            this.$syslogPort.val(config.syslog.port);
            this.syslogToggle.updateConfig(config.syslog.enabled);
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