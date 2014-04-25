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
            this.$frequency = this.$('[name="rollover-frequency"]');
            this.$maxHistory = this.$('[name="max-history"]');
            this.$maxSize = this.$('[name="max-size"]');
            this.$syslogHost = this.$('[name="syslog-host"]');
            this.$syslogPort = this.$('[name="syslog-port"]');

            this.logFileToggle.setElement(this.$('.logfile-toggle')).render();
            this.syslogToggle.setElement(this.$('.syslog-toggle')).render();
        },

        getConfig: function() {
            return {
                logFile: {
                    compression: this.$compression.val(),
                    enabled: this.logFileToggle.getConfig(),
                    maxHistory: Number(this.$maxHistory.val()),
                    maxSize: Number(this.$maxSize.val()),
                    rolloverFrequency: this.$frequency.val()
                },
                syslog: {
                    enabled: this.syslogToggle.getConfig(),
                    host: this.$syslogHost.val(),
                    port: Number(this.$syslogPort.val())
                }
            };
        },

        updateConfig: function(config) {
            Widget.prototype.updateConfig.apply(this, arguments);

            this.$compression.val(config.logFile.compression);
            this.$frequency.val(config.logFile.rolloverFrequency);
            this.$maxHistory.val(config.logFile.maxHistory);
            this.$maxSize.val(config.logFile.maxSize);
            this.logFileToggle.updateConfig(config.logFile.enabled);

            this.$syslogHost.val(config.syslog.host);
            this.$syslogPort.val(config.syslog.port);
            this.syslogToggle.updateConfig(config.syslog.enabled);
        },

        validateInputs: function() {
            var isValid = true;

            if (this.syslogToggle.getConfig()) {
                if ($.trim(this.$syslogHost.val()) === '') {
                    this.updateInputValidation(this.$syslogHost);
                    isValid = false;
                }

                var port = Number(this.$syslogPort.val());

                if (_.isNaN(port) || port <= 0 || port >= 65536) {
                    this.updateInputValidation(this.$syslogPort);
                    isValid = false;
                }
            }

            if (this.logFileToggle.getConfig()) {
                var maxHistory = Number(this.$maxHistory.val());

                if (_.isNaN(maxHistory) || maxHistory < 0 || maxHistory > 99999) {
                    this.updateInputValidation(this.$maxHistory);
                    isValid = false;
                }

                var maxSize = Number(this.$maxSize.val());

                if (_.isNaN(maxSize) || maxSize < 0) {
                    this.updateInputValidation(this.$maxSize);
                    isValid = false;
                }
            }

            return isValid;
        }
    });

});