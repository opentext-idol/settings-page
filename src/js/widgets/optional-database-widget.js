define([
    'settings/js/widgets/database-widget',
    'settings/js/controls/enable-view'
], function (DatabaseWidget, EnableView) {
    return DatabaseWidget.extend({
        initialize: function (options) {
            DatabaseWidget.prototype.initialize.call(this, options);
            this.enableView = new EnableView({enableIcon: 'icon-file', strings: this.strings});
        },

        render: function () {
            DatabaseWidget.prototype.render.call(this);
            this.enableView.render();
            this.$validateButtonParent.before(this.enableView.$el);
        },

        getConfig: function () {
            var datasourceConfig = DatabaseWidget.prototype.getConfig.call(this);
            return {
                datasource: datasourceConfig,
                enabled: this.enableView.getConfig()
            };
        },

        /**
         * @returns {boolean} True if the database is enabled; false otherwise
         */
        shouldValidate: function() {
            return this.enableView.getConfig();
        },

        updateConfig: function(config) {
            this.enableView.updateConfig(config.enabled);
            if (config.enabled) {
                DatabaseWidget.prototype.updateConfig.call(this, config.datasource);
            }
        }
    });
});
