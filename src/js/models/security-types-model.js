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
