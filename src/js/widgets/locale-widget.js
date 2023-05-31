/*
 * Copyright 2013-2015 Open Text.
 *
 * Licensed under the MIT License (the "License"); you may not use this file
 * except in compliance with the License.
 *
 * The only warranties for products and services of Open Text and its affiliates
 * and licensors ("Open Text") are as may be set forth in the express warranty
 * statements accompanying such products and services. Nothing herein should be
 * construed as constituting an additional warranty. Open Text shall not be
 * liable for technical or editorial errors or omissions contained herein. The
 * information contained herein is subject to change without notice.
 */

/**
 * @module settings/js/widgets/locale-widget
 */
define([
    'settings/js/widget',
    'text!settings/templates/widgets/locale-widget.html'
], function(Widget, template) {

    /**
     * @typedef LocaleWidgetStrings
     * @property {string} prefix Label for the dropdown
     */
    /**
     * @typedef LocaleWidgetOptions
     * @desc Extends WidgetOptions
     * @property {object.<string,string>} locales Available locales. Keys should be ISO codes while values should be
     * display names
     * @property {LocaleWidgetStrings} strings Strings for the widget
     */
    /**
     * @name module:settings/js/widgets/locale-widget.LocaleWidget
     * @desc Widget for setting a global or default locale
     * @constructor
     * @param {LocaleWidgetOptions} options Options for the widget
     * @extends module:settings/js/widget.Widget
     */
    return Widget.extend(/**@lends module:settings/js/widgets/locale-widget.LocaleWidget.prototype */{
        /**
         * @callback module:settings/js/widgets/locale-widget.LocaleWidget~LocaleWidgetTemplate
         * @param {LocaleWidgetOptions} parameters Parameters for the widget
         */
        /**
         * @desc Template for the widget. Override if using Bootstrap 3
         * @type module:settings/js/widgets/locale-widget.LocaleWidget~LocaleWidgetTemplate
         */
        localeTemplate: _.template(template),

        /**
         * @desc CSS classes for the widget.
         * @default {@link module:settings/js/widget.Widget#className|Widget#className} + ' form-horizontal'
         */
        className: Widget.prototype.className + ' form-horizontal',

        initialize: function(options) {
            Widget.prototype.initialize.call(this, options);
            this.locales = options.locales;
        },

        /**
         * @desc Renders the widget
         */
        render: function() {
            Widget.prototype.render.call(this);
            this.$content.append(this.localeTemplate({locales: this.locales, strings: this.strings}));
            this.$select = this.$('select[name=locale]');
        },

        /**
         * @desc Returns the current config for the widget
         * @returns {string} The ISO code of the currently selected locale
         */
        getConfig: function() {
            return this.$select.val();
        },

        /**
         * @desc Updates the widget with the given config
         * @param {string} config The new ISO code for the locale
         */
        updateConfig: function(config) {
            this.$select.val(config);
        }
    });

});
