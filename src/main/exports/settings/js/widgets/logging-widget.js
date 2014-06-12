define([
    'settings/js/widget',
    'settings/js/controls/enable-view',
    'text!settings/templates/widgets/logging-widget.html'
], function(Widget, EnableView, template) {

    var templateFunction = _.template(template);

    return Widget.extend({
        events: _.extend(Widget.prototype.events, {
            'click [name="test-logging"]': function() {
                if (!this.testRequest && this.validateSyslogInputs()) {
                    this.testRequest = $.ajax({
                        contentType: 'application/json',
                        data: JSON.stringify(this.getConfig().syslog),
                        dataType: 'json',
                        type: 'POST',
                        url: this.testURL,
                        complete: _.bind(function() {
                            this.testRequest = null;
                            this.updateTestSyslogButton();
                        }, this),
                        error: _.bind(function() {
                            this.$testResponse.text(this.strings.testFailure).removeClass('hide');
                        }, this),
                        success: _.bind(function(response) {
                            this.$testResponse.text(this.strings.testSuccess(response.message)).removeClass('hide');
                        }, this)
                    });

                    this.updateTestSyslogButton();
                }
            }
        }),

        initialize: function(options) {
            Widget.prototype.initialize.apply(this, arguments);
            this.testURL = options.testURL;

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
            this.$testButton = this.$('[name="test-logging"]');
            this.$testResponse = this.$('.logging-test-response');

            this.logFileToggle.setElement(this.$('.logfile-toggle')).render();
            this.syslogToggle.setElement(this.$('.syslog-toggle')).render();

            this.listenTo(this.logFileToggle, 'change', function(enabled) {
                this.logFileToggle.$el.closest('.settings-logging-section').find('.logging-control').prop('disabled', !enabled);
            });

            this.listenTo(this.syslogToggle, 'change', function(enabled) {
                if (!enabled && this.testRequest) {
                    this.testRequest.abort();
                    this.testRequest = null;
                }

                this.$testResponse.addClass('hide');
                this.syslogToggle.$el.closest('.settings-logging-section').find('.logging-control').prop('disabled', !enabled);
                this.updateTestSyslogButton();
            });

            this.updateTestSyslogButton();
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

        updateTestSyslogButton: function() {
            var $i = this.$testButton.find('i').removeClass();

            if (this.syslogToggle.getConfig()) {
                if (this.testRequest) {
                    this.$testButton.prop('disabled', true);
                    $i.addClass('icon-spin icon-refresh');
                } else {
                    this.$testButton.prop('disabled', false);
                    $i.addClass('icon-ok');
                }
            } else {
                this.$testButton.prop('disabled', true);
                $i.addClass('icon-ok');
            }
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

            if (this.logFileToggle.getConfig()) {
                var maxHistory = Number(this.$maxHistory.val());

                if (_.isNaN(maxHistory) || maxHistory % 1 !== 0 || maxHistory < 0 || maxHistory > 99999) {
                    this.updateInputValidation(this.$maxHistory);
                    isValid = false;
                }

                var maxSize = Number(this.$maxSize.val()) * Number(this.$maxSizeUnit.val());

                if (_.isNaN(maxSize) || maxSize % 1 !== 0 || maxSize < 0) {
                    this.updateInputValidation(this.$maxSize);
                    isValid = false;
                }
            }

            // Must be in this order or we won't see syslog validation messages if the log file section fails
            return this.validateSyslogInputs() && isValid;
        },

        validateSyslogInputs: function() {
            var isValid = true;

            if (this.syslogToggle.getConfig()) {
                if ($.trim(this.$syslogHost.val()) === '') {
                    this.updateInputValidation(this.$syslogHost);
                    isValid = false;
                }

                var port = Number(this.$syslogPort.val());

                if (_.isNaN(port) || port % 1 !== 0 || port <= 0 || port >= 65536) {
                    this.updateInputValidation(this.$syslogPort);
                    isValid = false;
                }
            }

            return isValid;
        }
    });

});