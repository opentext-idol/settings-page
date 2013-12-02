define([
    'js-utils/js/base-page',
    'settings/js/validate-on-save-modal',
    'js-utils/js/confirm',
    'js-utils/js/ensure-array',
    'js-utils/js/listenable',
    'text!settings/templates/settings-page.html'
], function(BasePage, SaveModal, confirm, ensureArray, listenable, template) {

    return BasePage.extend({
        // === Override these === //
        configModel: {},
        icon: 'icon-cog',
        initializeWidgets: $.noop,
        router: {},
        routeEvent: 'route:settings',
        routeRoot: '',
        scrollSelector: {},
        strings: {},
        validateUrl: '',
        vent: {},
        widgets: [],
        // ====================== //

        events: {
            'click .settings-restore': 'handleCancelButton',
            'submit form': 'handleSubmit'
        },

        initialize: function() {
            BasePage.prototype.initialize.apply(this, arguments);

            _.bindAll(this, 'getConfig', 'handleBeforeUnload', 'initializeWidgets', 'loadFromConfig', 'scrollToWidget', 'validate');
            this.listenTo(listenable(window), 'beforeunload', this.handleBeforeUnload);
            this.initializeWidgets();

            _.each(this.widgets, function(widget) {
                widget.on('validate', function() {
                    this.validate(widget);
                }, this);
            }, this);

            this.router.on(this.routeEvent, this.handleRouting, this);
        },

        render: function() {
            this.$el.html(_.template(template, {icon: this.icon, strings: this.strings}));
            this.$form = this.$('form');
            this.$scrollElement = $(this.scrollSelector);
            var $hr = this.$form.find('hr');

            _.each(this.widgets, function(widget) {
                widget.render();
                $hr.before(widget.el);
            }, this);

            this.configModel.onLoad(this.loadFromConfig);
            this.configModel.loaded || this.configModel.fetch();
            this.hasRendered = true;
        },

        getConfig: function() {
            var config = {};

            _.each(this.widgets, function(widget) {
                config[widget.configItem] = widget.getConfig();
            });

            return config;
        },

        handleBeforeUnload: function() {
            if (this.lastSavedConfig && !_.isEqual(this.getConfig(), this.lastSavedConfig)) {
                setTimeout(_.bind(function() {
                    this.vent.navigate(this.routeRoot, {trigger: true});
                }, this), 100);

                return this.strings.confirmUnload;
            }
        },

        handleCancelButton: function() {
            confirm({
                cancelClass: 'btn-success',
                cancelIcon: 'icon-remove',
                cancelText: this.strings.cancelCancel,
                okText: this.strings.cancelOk,
                okClass: 'btn-warning',
                message: this.strings.cancelMessage,
                title: this.strings.cancelTitle,
                okHandler: _.bind(function() {
                    this.loadFromConfig();
                    this.$scrollElement.scrollTop(0);
                }, this)
            });

            return false;
        },

        handleRouting: function(configItem) {
            if (configItem) {
                this.hasRendered || this.render();

                var widget = _.find(this.widgets, function(widget) {
                    return widget.configItem === configItem;
                });

                widget && this.scrollToWidget(widget);
                this.vent.navigate(this.routeRoot, {replace: true, trigger: false});
            }
        },

        handleSubmit: function() {
            var currentConfig = this.getConfig();
            var passedClientValidation = true;
            var hasScrolled = false;

            _.each(this.widgets, function(widget) {
                if (widget.shouldValidate()) {
                    var isValid = widget.validateInputs();

                    if (!isValid) {
                        passedClientValidation = false;

                        if (!hasScrolled) {
                            this.scrollToWidget(widget);
                            hasScrolled = true;
                        }
                    }
                }
            }, this);

            if (passedClientValidation) {
                var serversToValidate = [];

                _.each(this.widgets, function(widget) {
                    if (widget.shouldValidate()) {
                        serversToValidate.push(widget.configItem);
                        widget.lastValidationConfig = currentConfig[widget.configItem];
                    }
                });

                var saveModal = new SaveModal({
                    config: currentConfig,
                    configModel: this.configModel,
                    success: _.bind(function() {
                        this.lastSavedConfig = currentConfig;
                        this.$scrollElement.scrollTop(0);
                    }, this),
                    strings: this.strings.saveModal
                });

                // ensures validation on save is propagated to associated widget
                saveModal.on('validation', function(validation) {
                    if (validation === 'SUCCESS') {
                        validation = {};

                        _.each(serversToValidate, function(serverName) {
                            validation[serverName] = true;
                        });
                    }

                    _.each(validation, function(isValid, serverName) {
                        var widget = _.find(this.widgets, function(widget) {
                            return widget.configItem === serverName;
                        });

                        widget.handleValidation(currentConfig[serverName], {valid: isValid});
                    }, this);
                }, this);
            }

            return false;
        },

        loadFromConfig: function() {
            var config = this.configModel.get('config');
            var serversToValidate = [];
            this.$('.settings-description').text(this.strings.description(this.configModel.get('configEnvVariable'), this.configModel.get('configPath')));

            _.each(this.widgets, function(widget) {
                widget.updateConfig(config[widget.configItem]);

                if (widget.shouldValidate()) {
                    serversToValidate.push(widget);
                }
            });

            this.validate(serversToValidate);
            this.lastSavedConfig = this.getConfig();
        },

        scrollToWidget: function(widget) {
            this.$scrollElement.scrollTop(this.$scrollElement.scrollTop() + widget.$el.position().top - this.$scrollElement.offset().top);
        },

        validate: function(servers) {
            servers = ensureArray(servers);
            var config = {};

            _.each(servers, function(server) {
                server.lastValidationConfig = config[server.configItem] = server.getConfig();
            });

            $.ajax(this.validateUrl, {
                contentType: 'application/json',
                dataType: 'json',
                type: 'POST',
                data: JSON.stringify(config),
                success: function(response) {
                    _.each(servers, function(server) {
                        server.handleValidation(config[server.configItem], response[server.configItem]);
                    });
                }
            });
        }
    });
});
