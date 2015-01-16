/*
 * Copyright 2013-2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
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