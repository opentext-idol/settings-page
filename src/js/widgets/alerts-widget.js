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
 * @module settings/js/widgets/alerts-widget
 */
define([
    'underscore',
    'settings/js/widget',
    'text!settings/templates/widgets/alerts-widget.html'
], function(_, Widget, template) {

    template = _.template(template);

    /**
     * @typedef AlertsWidgetStrings
     * @desc Extends WidgetStrings
     * @property {string} day String representing a single day
     * @property {string} days String representing multiple days
     * @property {string} prefix Label for the form input
     */
    /**
     * @typedef AlertsWidgetOptions
     * @desc Extends WidgetOptions
     * @property {AlertsWidgetStrings} strings Strings for the widget
     */
    /**
     * @name module:settings/js/widgets/alerts-widget.AlertsWidget
     * @desc Widget for configuring how long alerts should be kept for before expiring
     * @param {AlertsWidgetOptions} options Options for the widget
     * @constructor
     * @extends module:settings/js/widget.Widget
     */
    return Widget.extend(/** @lends module:settings/js/widgets/alerts-widget.AlertsWidget.prototype */ {
        className: Widget.prototype.className + ' form-horizontal',

        events: {
            'change input[name=history-secs]': 'processPlural'
        },

        initialize: function(options) {
            Widget.prototype.initialize.call(this, options);
            _.bindAll(this, 'processPlural');
        },

        /**
         * @desc Renders the widget by first calling {@link module:settings/js/widget.Widget#render|Widget.render} and
         * then rendering the required input for this widget
         */
        render: function() {
            Widget.prototype.render.call(this);
            this.$content.append(template({strings: this.strings}));
            this.$input = this.$('input[name=history-secs]');
            this.$span = this.$input.siblings('span');
        },

        /**
         * @typedef AlertsWidgetConfig
         * @property {number} historySecs The number of seconds alerts should be retained for
         */
        /**
         * @returns {AlertsWidgetConfig} The config for the widget
         */
        getConfig: function() {
            //noinspection JSValidateTypes
            return {historySecs: Number(this.$input.val()) * 86400};
        },

        // TODO: remove this as it internationalises badly
        /**
         * @desc Sets the text succeeding the input to strings.day if the value of the input is 1, or days otherwise
         * @deprecated This will be removed in a future version as it internationalises badly
         */
        processPlural: function() {
            var durationDays = Number(this.$input.val());
            this.$span.text(durationDays === 1 ? this.strings.day : this.strings.days);
        },

        /**
         * @desc Updates the widget with the given config, converting the time in seconds into days
         * @param {AlertsWidgetConfig} config The new config for the widget
         */
        updateConfig: function(config) {
            this.$input.val(Number((config.historySecs / 86400).toFixed(1)));
            this.processPlural();
        }
    });

});
