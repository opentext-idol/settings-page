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
            this.stopListening();
            Widget.prototype.render.apply(this, arguments);

            this.$content.append(templateFunction({strings: this.strings}));
            this.$compression = this.$('[name="file-compression"]');
            this.$frequency = this.$('[name="rollover-frequency"]');
            this.$maxHistory = this.$('[name="max-history"]');
            this.$maxSize = this.$('[name="max-size"]');
            this.$maxSizeUnit = this.$('[name="max-size-unit"]');
            this.$syslogHost = this.$('[name="syslog-host"]');
            this.$syslogPort = this.$('[name="syslog-port"]');

            this.logFileToggle.setElement(this.$('.logfile-toggle')).render();
            this.syslogToggle.setElement(this.$('.syslog-toggle')).render();

            _.each([this.logFileToggle, this.syslogToggle], function(view) {
                this.listenTo(view, 'change', function(enabled) {
                    view.$el.closest('.settings-logging-section').find('input, select').prop('disabled', !enabled);
                });
            }, this);
        },

        getConfig: function() {
            var maxSize = Math.floor(Number(this.$maxSize.val())) * Number(this.$maxSizeUnit.val());

            return {
                logFile: {
                    compression: this.$compression.val(),
                    enabled: this.logFileToggle.getConfig(),
                    maxHistory: Math.floor(Number(this.$maxHistory.val())),
                    maxSize: maxSize,
                    rolloverFrequency: this.$frequency.val()
                },
                syslog: {
                    enabled: this.syslogToggle.getConfig(),
                    host: this.$syslogHost.val(),
                    port: Math.floor(Number(this.$syslogPort.val()))
                }
            };
        },

        updateConfig: function(config) {
            Widget.prototype.updateConfig.apply(this, arguments);

            var maxSize = config.logFile.maxSize / 1024;

            if (maxSize < 1) {
                maxSize = 1;
            }

            var coefficient = 1024;

            _.each(['MB', 'GB'], function() {
                if (maxSize >= 1024) {
                    maxSize /= 1024;
                    coefficient *= 1024;
                }
            });

            this.$compression.val(config.logFile.compression);
            this.$frequency.val(config.logFile.rolloverFrequency);
            this.$maxHistory.val(config.logFile.maxHistory);
            this.$maxSize.val(maxSize);
            this.$maxSizeUnit.val(coefficient);
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

                if (_.isNaN(port) || port%1 != 0 || port <= 0 || port >= 65536) {
                    this.updateInputValidation(this.$syslogPort);
                    isValid = false;
                }
            }

            if (this.logFileToggle.getConfig()) {
                var maxHistory = Number(this.$maxHistory.val());

                if (_.isNaN(maxHistory) || maxHistory%1 != 0 || maxHistory < 0 || maxHistory > 99999) {
                    this.updateInputValidation(this.$maxHistory);
                    isValid = false;
                }

                var maxSize = Number(this.$maxSize.val()) * Number(this.$maxSizeUnit.val());

                if (_.isNaN(maxSize) || maxSize%1 != 0 || maxSize < 0) {
                    this.updateInputValidation(this.$maxSize);
                    isValid = false;
                }
            }

            return isValid;
        }
    });

});