define([
    'settings/js/widget',
    'text!settings/templates/widgets/tasks-widget.html'
], function(Widget, template) {

    template = _.template(template);

    return Widget.extend({
        className: Widget.prototype.className + ' form-horizontal',

        events: {
            'change input[name=dashboard-history-mins]': 'processPlurals',
            'change input[name=footer-history-mins]': 'processPlurals',
            'change input[name=history-days]': 'processPlurals'
        },

        initialize: function(options) {
            Widget.prototype.initialize.call(this, options);
            _.bindAll(this, 'processPlurals');
        },

        render: function() {
            Widget.prototype.render.call(this);
            this.$el.append(template({strings: this.strings}));

            this.$dashboard = this.$('input[name=dashboard-history-mins]');
            this.$footer = this.$('input[name=footer-history-mins]');
            this.$history = this.$('input[name=history-days]');

            this.$dashboardSpan = this.$dashboard.siblings('span');
            this.$footerSpan = this.$footer.siblings('span');
            this.$historySpan = this.$history.siblings('span');
        },

        getConfig: function() {
            var keepHistoryForever = this.$('input[name=history-forever][value=true]').prop('checked');
            var historySecs = Math.abs(this.$history.val()) * 86400;

            return {
                dashboardHistorySecs: this.$dashboard.val() * 60,
                footerHistorySecs: this.$footer.val() * 60,
                historySecs: keepHistoryForever ? -historySecs : historySecs
            };
        },

        processPlurals: function() {
            this.$dashboardSpan.html(this.$dashboard.val() == 1 ? this.strings.min : this.strings.mins);
            this.$footerSpan.html(this.$footer.val() == 1 ? this.strings.min : this.strings.mins);
            this.$historySpan.html(this.$history.val() == 1 ? this.strings.day : this.strings.days);
        },

        updateConfig: function(config) {
            var dashboardMins = Number((config.dashboardHistorySecs / 60).toFixed(0));
            var footerMins = Number((config.footerHistorySecs / 60).toFixed(0));
            var historyDays = Number((Math.abs(config.historySecs) / 86400).toFixed(1));

            this.$dashboard.val(dashboardMins);
            this.$footer.val(footerMins);
            this.$history.val(historyDays);
            this.$('input[name=history-forever][value=' + (config.historySecs < 0) + ']').prop('checked', true);

            this.processPlurals();
        }
    });

});
