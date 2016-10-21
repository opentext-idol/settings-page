/*
 * Copyright 2013-2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

/**
 * @module settings/js/widgets/community-widget
 */
define([
    'underscore',
    'settings/js/widgets/aci-widget',
    'settings/js/controls/aci-widget-dropdown-view',
    'settings/js/models/security-types-model'
], function(_, AciWidget, DropdownView, SecurityTypesModel) {

    /**
     * @typedef CommunityWidgetStrings
     * @desc Extends AciWidgetStrings
     * @property {string} loginTypeLabel Label for the login types dropdown
     * @property {string} fetchSecurityTypes An instruction saying that the test connection button will retrieve valid
     * security types
     * @property {string} invalidSecurityType Message which states a valid security type has not been selected
     */
    /**
     * @typedef CommunityWidgetOptions
     * @desc Extends AciWidgetOptions
     * @property {string} securityTypesUrl Url for fetching security types from
     * @property {CommunityWidgetStrings} strings Strings for the widget
     */
    /**
     * @name module:settings/js/widgets/community-widget.CommunityWidget
     * @desc Widget for configuring an IDOL Community server. As AciWidget, but allows the configuration of a repository
     * to use for authentication
     * @param {CommunityWidgetOptions} options Options for the widget
     * @constructor
     * @extends module:settings/js/widgets/aci-widget.AciWidget
     */
    return AciWidget.extend(/** @lends settings/js/widgets/community-widget.CommunityWidget.prototype */{
        initialize: function(options) {
            AciWidget.prototype.initialize.call(this, options);

            _.bindAll(this, 'communityHasChanged', 'getCommunity');

            this.dropdownView = new DropdownView({
                url: options.securityTypesUrl,
                property: 'securityTypes',
                label: this.strings.loginTypeLabel,
                fetchMessage: this.strings.fetchSecurityTypes,
                invalidMessage: this.strings.invalidSecurityType,
                template: options.template,
                exceptionalValues: ['cas', 'external'],
                hasChanged: this.communityHasChanged,
                ModelConstructor: SecurityTypesModel
            });
        },

        /**
         * @desc Renders the widget by first calling {@link module:settings/js/widgets/aci-widget.AciWidget#render|AciWidget#render}
         * and then rendering the security types
         */
        render: function() {
            AciWidget.prototype.render.call(this);

            //noinspection JSUnresolvedFunction
            this.$aciDetails = this.$('div.' + this.controlGroupClass).eq(0);

            this.$('button[name="validate"]').parent().after(this.dropdownView.$el);
            this.dropdownView.render();
        },

        /**
         * @returns {boolean} True if the configuration has changed since the widget was last saved; false otherwise
         */
        communityHasChanged: function() {
            return !_.isEqual(this.getCommunity(), this.lastValidationConfig.community);
        },

        /**
         * @returns {AciWidgetConfig} The configuration of the Community server
         */
        getCommunity: function() {
            return AciWidget.prototype.getConfig.call(this);
        },

        /**
         * @typedef CommunityWidgetConfiguration
         * @property {AciWidgetConfig} community configuration of the Community server
         * @property {string} method The login method to use with the Community server
         */
        /**
         * @desc Returns the configuration of the widget
         * @returns {CommunityWidgetConfiguration}
         */
        getConfig: function() {
            //noinspection JSValidateTypes
            return {
                community: this.getCommunity(),
                method: this.dropdownView.getConfig()
            };
        },

        handleInputChange: function() {
            this.hideValidationInfo();

            if (!_.isUndefined(this.lastValidation) && !this.communityHasChanged()) {
                this.setValidationFormatting(this.lastValidation ? this.successClass : this.errorClass);
                this.dropdownView.toggleInput(this.lastValidation && this.dropdownView.hasValues());
            } else {
                this.setValidationFormatting('clear');
                this.dropdownView.toggleInput(false);
            }
        },

        /**
         * @desc Handles the results of server side validation. Fetches new security types if the config is valid
         */
        handleValidation: function(config, response) {
            if (_.isEqual(config.community, this.lastValidationConfig.community)) {
                this.lastValidation = response.valid;
                this.lastValidation && this.dropdownView.fetchNewValues(config.community);
                this.hideValidationInfo();

                this.displayValidationMessage(!this.communityHasChanged(), response);
            }
        },

        /**
         * @desc Sets the validation formatting to the given state
         * @param {string} state If 'clear', removes validation formatting. Otherwise should be one of this.successClass
         * or this.errorClass, and will set the formatting accordingly
         */
        setValidationFormatting: function(state) {
            if (state === 'clear') {
                this.$aciDetails.removeClass(this.successClass + ' ' + this.errorClass);
                this.dropdownView.clearValidationFormatting(this.errorClass);
            } else {
                this.$aciDetails.addClass(state)
                    .removeClass(state === this.successClass ? this.errorClass : this.successClass);
            }
        },

        /**
         * @desc Validation button handler. Tests the connection to the ACI server
         * @fires validate Event indicating that validation has occurred
         */
        triggerValidation: function() {
            this.setValidationFormatting('clear');
            this.hideValidationInfo();

            if (AciWidget.prototype.validateInputs.apply(this, arguments)) {
                //noinspection JSUnresolvedFunction
                this.trigger('validate');
            }
        },

        /**
         * @desc Updates the widget with the given configuration
         * @param {CommunityWidgetConfiguration} config
         */
        updateConfig: function(config) {
            AciWidget.prototype.updateConfig.call(this, config.community);
            this.dropdownView.updateConfig(config.method);
        },

        /**
         * @desc Validates the widget and applies formatting if necessary
         * @returns {boolean} True if the login type is not 'default' and all the AciWidget requirements are met; false
         * otherwise
         */
        validateInputs: function() {
            var isLoginTypeValid = this.getConfig() !== 'default';

            if (!isLoginTypeValid) {
                this.updateInputValidation(this.dropdownView.getDropdownElement(), false);
                this.dropdownView.toggleInput(false);
            }

            // This is in this order so that formatting from the super method is applied
            return AciWidget.prototype.validateInputs.apply(this, arguments) && isLoginTypeValid;
        }
    });

});
