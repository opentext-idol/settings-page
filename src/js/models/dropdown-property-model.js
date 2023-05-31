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
 * @module settings/js/models/security-types
 */
define([
    'backbone',
    'underscore'
], function(Backbone, _) {

    /**
     * @typedef DropdownPropertyOptions
     * @property {string} url The url to fetch the dropdown values from
     */
    /**
     * @name module:settings/js/models/dropdown-property-model.DropdownPropertyValues
     * @desc Model for fetching security types
     * @param {DropdownPropertyAttributes} attributes Initial attributes
     * @param {DropdownPropertyOptions} options Options for the model
     * @constructor
     * @extends Backbone.Model
     */
    return Backbone.Model.extend(/** @lends module:settings/js/models/dropdown-property-model.DropdownPropertyValues.prototype */ {
        initialize: function(attributes, options) {
            this.url = options.url;
        },

        /**
         * @desc Fetches the dropdown property values. If already fetching, the previous request is aborted
         * @param {object} options Backbone fetch options
         */
        fetch: function(options) {
            this.xhr && this.xhr.abort();
            options = options || {};
            var originalComplete = options.complete;

            options.complete = _.bind(function() {
                delete this.xhr;
                originalComplete && originalComplete();
            }, this);

            this.xhr = Backbone.Model.prototype.fetch.call(this, options);
        }
    });

});
