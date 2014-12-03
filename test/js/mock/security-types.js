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