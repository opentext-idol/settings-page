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
    'settings/js/widgets/tasks-widget',
    'test/test-utils',
    'jasmine-jquery'
], function(TasksWidget, utils) {

    describe('Tasks widget', function() {
        beforeEach(function() {
            this.widget = new TasksWidget({
                configItem: 'tasks',
                description: null,
                strings: utils.createStringMap('dashboardPrefix', 'day', 'days', 'footerPrefix', 'keepTasks', 'keepTasksForever',
                    'min', 'mins'),
                title: 'Tricky Tasks'
            });

            this.widget.render();
            this.widget.updateConfig({dashboardHistorySecs: 5 * 60, footerHistorySecs: 60 * 60, historySecs: 15 * 86400});

            this.$dashboard = this.widget.$('input[name=dashboard-history-mins]');
            this.$footer = this.widget.$('input[name=footer-history-mins]');
            this.$history = this.widget.$('input[name=history-days]');

            this.$dashboardSpan = this.$dashboard.siblings('span');
            this.$footerSpan = this.$footer.siblings('span');
            this.$historySpan = this.$history.siblings('span');
        });

        utils.testSuperProperties.call(this, {configItem: 'tasks', title: 'Tricky Tasks', description: null});

        it('displays the correct config', function() {
            expect(this.$dashboard).toHaveValue('5');
            expect(this.$footer).toHaveValue('60');
            expect(this.$history).toHaveValue('15');

            expect(this.widget.$('input[name=history-forever][value=false]')).toHaveProp('checked', true);
            expect(this.widget.$('input[name=history-forever][value=true]')).toHaveProp('checked', false);

            expect(this.$dashboardSpan).toHaveText('mins');
            expect(this.$footerSpan).toHaveText('mins');
            expect(this.$historySpan).toHaveText('days');
        });

        it('returns the correct config', function() {
            this.$footer.val(75);
            this.$history.val(12);

            expect(this.widget.getConfig()).toEqual({dashboardHistorySecs: 5 * 60, footerHistorySecs: 75 * 60, historySecs: 12 * 86400});
        });

        it('should display singular day/min or plural days/mins correctly', function() {
            this.$footer.val(1).trigger('change');
            this.$dashboard.val(1).trigger('change');
            this.$history.val(1).trigger('change');

            expect(this.$footerSpan).toHaveText('min');
            expect(this.$dashboardSpan).toHaveText('min');
            expect(this.$historySpan).toHaveText('day');

            this.$footer.val(2).trigger('change');
            this.$dashboard.val(2).trigger('change');
            this.$history.val(2).trigger('change');

            expect(this.$footerSpan).toHaveText('mins');
            expect(this.$dashboardSpan).toHaveText('mins');
            expect(this.$historySpan).toHaveText('days');
        });

        it('should return a negative historySecs if we select "keep forever"', function() {
            this.widget.$('input[name=history-forever][value=true]').prop('checked', true);

            expect(this.widget.getConfig()).toEqual({dashboardHistorySecs: 5 * 60, footerHistorySecs: 60 * 60, historySecs: - 15 * 86400});
        });
    });


});
