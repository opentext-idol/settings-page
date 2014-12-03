define([
    'backbone'
], function(Backbone) {

    return Backbone.Model.extend({
        initialize: function(attributes, options) {
            this.url = options.url;
        },

        fetch: function(options) {
            this.xhr && this.xhr.abort();
            options = options || {};
            var originalComplete = options.complete;

            options.complete = _.bind(function() {
                delete this.xhr;
                originalComplete && originalComplete();
            }, this);

            this.xhr = Backbone.Model.prototype.fetch.call(this, options);
        },

        parse: function(response) {
            response.securityTypes = response.securityTypes && _.without(response.securityTypes, 'default');
            return response;
        }
    });

});