define([
    'settings/js/server-widget',
    'text!settings/templates/widgets/aci-widget.html'
], function(ServerWidget, template) {

    template = _.template(template);

    return ServerWidget.extend({
        initialize: function(options) {
            ServerWidget.prototype.initialize.call(this, options);
        },

        render: function() {
            ServerWidget.prototype.render.call(this);

            this.$('button[name=validate]').parent().before(template({
                strings: this.strings
            }));

            this.$host = this.$('input[name=host]');
            this.$port = this.$('input[name=port]');
            this.$protocol = this.$('select[name=protocol]');
        },

        getConfig: function() {
            return {
                host: this.$host.val(),
                port: Number(this.$port.val()),
                protocol: this.$protocol.val(),
				productType: this.productType,
				indexErrorMessage: this.indexErrorMessage
            }
        },

        updateConfig: function(config) {
            ServerWidget.prototype.updateConfig.apply(this, arguments);

            this.$host.val(config.host);
            this.$port.val(config.port);
            this.$protocol.val(config.protocol);
			this.productType = config.productType;
			this.indexErrorMessage = config.indexErrorMessage;
        },

        validateInputs: function() {
            if (this.$host.val() === '') {
                this.updateInputValidation(this.$host);
                return false;
            }

            return true;
        }
    });

});
