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
 * Allows dropdown view to be cleanly removed from widgets if desired
 */
define([
    'backbone'
], function (Backbone) {
    return Backbone.View.extend({
        $el: '',

        initialize: function () {
        },

        render: function () {
        },

        fetchNewValues: function () {
        },

        hasValues: function () {
            return false;
        },

        getConfig: function () {
            return null;
        },
        
        handleNewValues: function () {
        },

        clearValidationFormatting: function () {
        },
        
        toggleInput: function () {
        },

        updateConfig: function () {
        },
        
        updateDropdown: function () {
        },
        
        getDropdownElement: function () {
            return null;
        }
    });

});
