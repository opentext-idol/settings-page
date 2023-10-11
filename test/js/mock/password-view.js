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

define([
    'underscore',
    'backbone'
], function(_, Backbone) {

    return Backbone.View.extend({
        initialize: function(options) {
            this.enabled = _.isUndefined(options.enabled) ? true : options.enabled;
        },

        render: $.noop,
        getConfig: $.noop,

        setEnabled: function(state) {
            this.enabled = state;
        },

        updateConfig: $.noop,

        validateInputs: function() {
            return true;
        }
    });

});
