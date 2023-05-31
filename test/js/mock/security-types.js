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
    'backbone'
], function(Backbone) {

    var exceptionString = 'Security types mock error: Invalid arguments!';

    return function() {
        this.securityTypes = undefined;

        _.extend(this, Backbone.Events);

        this.fetch = function(options) {};

        this.get = function(attr) {
            if (attr === 'securityTypes') {
                return this.securityTypes;
            }

            throw exceptionString;
        };

        this.unset = function(attr) {
            if (attr === 'securityTypes') {
                this.securityTypes = undefined;
            } else {
                throw exceptionString;
            }
        };
    }

});
