/*
 * Copyright 2013-2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
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
