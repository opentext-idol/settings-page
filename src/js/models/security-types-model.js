/*
 * Copyright 2013-2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

/**
 * @module settings/js/models/security-types
 */
define([
    'underscore',
    'settings/js/models/dropdown-property-model'
], function(_, DropdownPropertyModel) {
    return DropdownPropertyModel.extend({
        /**
         * @typedef DropdownPropertyAttributes
         * @property {Array<String>} dropdownPropertyValues An array of strings representing the dropdown property values
         */
        /**
         * Parse the list of security types to remove any type named "default"
         * @param {DropdownPropertyAttributes} response
         * @returns {DropdownPropertyAttributes} response
         */
        parse: function(response) {
            response.securityTypes = response.securityTypes && _.without(response.securityTypes, 'default');
            return response;
        }
    });
});