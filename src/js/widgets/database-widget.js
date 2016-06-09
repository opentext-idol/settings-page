/*
 * Copyright 2013-2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

/**
 * @module settings/js/widgets/database-widget
 */
define([
    'settings/js/server-widget',
    'settings/js/controls/password-view',
    'text!settings/templates/widgets/database-widget.html',
    'text!settings/templates/widgets/databases-widget.html'
], function (ServerWidget, PasswordView, template, selectionTemplate) {
    /**
     * @typedef DatabaseWidgetStrings
     * @desc Includes all properties from ServerWidgetStrings and PasswordViewStrings
     * @property {string} databaseCheckbox Label for the database checkbox
     * @property {string} databaseLabel Label for the database field
     * @property {string} flywayMigrationFromEmpty String to display if the database will need to be set up for the
     * application
     * @property {string} flywayMigrationUpgrade String to display if the database schema needs to be upgraded
     * @property {string} hostPlaceholder Placeholder for the host input
     * @property {string} portPlaceholder Placeholder for the port input
     * @property {string} usernameLabel Label for the username input
     * @property {string} validateDatabaseBlank Message to display if the database is blank
     * @property {string} validateHostBlank Message to display if the host is blank
     * @property {string} validateUsernameBlank Message to display if the username is blank
     */
    /**
     * @typedef DatabaseWidgetOptions
     * @desc Extends ServerWidgetOptions
     * @property {boolean} canDisable True if the database can be disabled; false otherwise
     * @property {DatabaseWidgetStrings} strings Strings for the widget
     */
    /**
     * @name module:settings/js/widgets/database-widget.DatabaseWidget
     * @desc Widget for configuring a relational database
     * @constructor
     * @param {DatabaseWidgetOptions} options Options for the widget
     * @extends module:settings/js/server-widget.ServerWidget
     */
    return ServerWidget.extend(/** @lends module:settings/js/widgets/database-widget.DatabaseWidget.prototype */{
        className: ServerWidget.prototype.className,

        /**
         * @typedef DatabaseWidgetTemplateParameters
         * @property {DatabaseWidgetStrings} strings Strings for the template
         */
        /**
         * @callback module:settings/js/widgets/database-widget.DatabaseWidget~DatabaseTemplate
         * @param {DatabaseWidgetTemplateParameters} parameters
         */
        /**
         * @desc Base template for the widget. Override if using Bootstrap 3
         * @type module:settings/js/widgets/database-widget.DatabaseWidget~DatabaseTemplate
         */
        databaseTemplate: _.template(template),
        databasesTemplate: _.template(selectionTemplate),

        formControlClass: '',

        initialize: function (options) {
            ServerWidget.prototype.initialize.call(this, options);
            this.passwordView = new PasswordView({
                strings: this.strings,
                className: this.controlGroupClass,
                formControlClass: this.formControlClass
            });

            this.databaseTypes = {
                postgres: {
                    protocol: 'jdbc:postgresql',
                    hibernateDialect: 'org.hibernate.dialect.PostgreSQL82Dialect',
                    driverClassName: 'org.postgresql.Driver',
                    buildUrl: _.bind(function () {
                        var database = this.$databaseCheckbox.prop('checked') ? this.$username.val() : this.$database.val();
                        return 'jdbc:postgresql://' + this.$host.val() + ':' + this.$port.val() + '/' + database;
                    }, this),
                    parseUrl: function (url) {
                        var captureGroups = /^jdbc:postgresql:\/\/([^:]*):(\d*)\/(.*)$/.exec(url);
                        return captureGroups ? {
                            protocol: 'jdbc:postgresql',
                            host: captureGroups[1],
                            port: captureGroups[2],
                            database: captureGroups[3]
                        } : {protocol: 'jdbc:postgresql'}
                    }
                },
                h2: {
                    hibernateDialect: 'org.hibernate.dialect.H2Dialect',
                    driverClassName: 'org.h2.Driver',
                    username: 'sa',
                    buildUrl: function () {
                        return 'jdbc:h2:' + (options.databaseDir ? 'file:' + options.databaseDir + '/data/' : 'mem:') + options.databaseName  + ';DB_CLOSE_ON_EXIT=FALSE';
                    }
                }
            };

            this.databaseType = options.databaseType;
        },

        /**
         * @desc Renders the widget
         */
        render: function () {
            ServerWidget.prototype.render.call(this);

            this.$validateButtonParent = this.$('button[name=validate]').parent();
            this.$validateButtonParent.before(this.databasesTemplate({
                strings: this.strings
            }));

            this.$('.database-config').append(this.databaseTemplate({
                strings: this.strings
            }));

            this.$databaseType = this.$('.database-type-input');
            this.$database = this.$('input[name=database]');
            this.$databaseCheckbox = this.$('input[type="checkbox"]');
            this.$host = this.$('input[name=host]');
            this.$port = this.$('input[name=port]');
            this.$username = this.$('input[name=username]');
            this.$protocol = this.$('.protocol');

            this.passwordView.render();
            this.$databaseCheckbox.parent().before(this.passwordView.$el);

            if (this.databaseType) {
                this.$('.database-type-selection').addClass('hide');
            }

            var toggleInputs = _.bind(function () {
                var databaseType = this.databaseType || this.$databaseType.val();
                this.$('.database-config').toggleClass('hide', databaseType === 'h2');
                this.$protocol.text(this.databaseTypes[databaseType].protocol);
            }, this);

            this.$databaseType.on('input', toggleInputs);

            toggleInputs();
        },

        /**
         * @desc Returns the configuration for the widget
         * @returns The configuration for the widget
         */
        getConfig: function () {
            var databaseType = this.databaseType || this.$databaseType.val();
            var datasourceInfo = this.databaseTypes[databaseType];
            return _.extend({
                platform: databaseType,
                hibernateDialect: datasourceInfo.hibernateDialect,
                driverClassName: datasourceInfo.driverClassName,
                url: datasourceInfo.buildUrl(),
                username: datasourceInfo.username || this.$username.val()
            }, this.passwordView.getConfig());
        },

        /**
         * @desc Handles input validation. Checking the database checkbox disables the database input. If the database
         * checkbox is checked, sets value of the database input to the value of the username input
         * @param {Event} evt jQuery event
         */
        handleInputChange: function (evt) {
            ServerWidget.prototype.handleInputChange.apply(this, arguments);
            var $input = $(evt.target);

            if ($input.is(this.$databaseCheckbox)) {
                this.$database.prop('disabled', this.$databaseCheckbox.prop('checked'));
            }

            if (this.$databaseCheckbox.prop('checked') && ($input.is(this.$databaseCheckbox) || $input.is(this.$username))) {
                this.$database.val(this.$username.val());
            }
        },

        /**
         * @typedef DatabaseValidationResponse
         * @property {string} data.version String defining the version of the migration
         */
        /**
         * @desc Returns a message stating validation was successful. If response.data.sourceVersion === '0', returns
         * this.strings.flywayMigrationFromEmpty. If response.data is defined, returns
         * this.strings.flywayMigrationUpgrade. Otherwise returns this.strings.validateSuccess.
         * @param {DatabaseValidationResponse} response
         * @returns {string}
         */
        getValidationSuccessMessage: function(response) {
            // if we get back flyway migration data, use that in the message
            if (response.data) {
                if(response.data.sourceVersion === '0') {
                    return this.strings.flywayMigrationFromEmpty;
                }
                else {
                    return this.strings.flywayMigrationUpgrade;
                }
            }
            else {
                return ServerWidget.prototype.getValidationSuccessMessage.call(this, response);
            }
        },

        /**
         * @returns {boolean} True
         */
        shouldValidate: function () {
            return true;
        },

        /**
         * @desc Updates the widget with new configuration
         * @param config The new config for the wizard
         */
        updateConfig: function (config) {
            ServerWidget.prototype.updateConfig.apply(this, arguments);

            if (config.platform && config.platform !== 'h2') {
                var serverConfig = this.databaseTypes[config.platform].parseUrl(config.url);
                this.protocol = serverConfig.protocol;
                this.$protocol.text(this.protocol);
                this.$database.val(serverConfig.database);
                this.$host.val(serverConfig.host);
                this.$port.val(serverConfig.port);
                this.$username.val(config.username);
                this.passwordView.updateConfig(config);

                if (!serverConfig.database && config.username) {
                    this.$database.val(config.username);
                }
            }

            var checkboxState = this.$database.val() === this.$username.val();
            this.$databaseCheckbox.prop('checked', checkboxState);
            this.$database.prop('disabled', checkboxState);
        },

        /**
         * @desc Validates the widget and applies formatting appropriately
         * @returns {boolean} False if any of host, username and database are blank or the password is invalid; true
         * otherwise
         */
        validateInputs: function () {
            var isValid = true;

            if (this.shouldValidate()) {
                var config = this.getConfig();
                isValid = this.validateDatasourceConfig(config);
            }

            return isValid;
        },

        validateDatasourceConfig: function (config) {
            var isValid = true;

            if (config.platform && config.platform !== 'h2') {
                var serverConfig = this.databaseTypes[config.platform].parseUrl(config.url);
                if (!serverConfig.host) {
                    isValid = false;
                    this.updateInputValidation(this.$host, false);
                }

                if (!config.username) {
                    isValid = false;
                    this.updateInputValidation(this.$username, false);
                }

                if (!serverConfig.database) {
                    isValid = false;
                    this.updateInputValidation(this.$database, false);
                }

                // needs to be this way round to apply formatting
                isValid = this.passwordView.validateInputs() && isValid;
            }

            return isValid;
        }
    });

});
