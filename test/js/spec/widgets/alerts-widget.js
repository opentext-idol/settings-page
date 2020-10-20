/*
 * (c) Copyright 2013-2015 Micro Focus or one of its affiliates.
 *
 * Licensed under the MIT License (the "License"); you may not use this file
 * except in compliance with the License.
 *
 * The only warranties for products and services of Micro Focus and its affiliates
 * and licensors ("Micro Focus") are as may be set forth in the express warranty
 * statements accompanying such products and services. Nothing herein should be
 * construed as constituting an additional warranty. Micro Focus shall not be
 * liable for technical or editorial errors or omissions contained herein. The
 * information contained herein is subject to change without notice.
 */

define([
    'settings/js/widgets/alerts-widget',
    'test/test-utils',
    'jasmine-jquery'
], function(AlertsWidget, utils) {

    describe('Alerts widget', function() {
        beforeEach(function() {
            this.widget = new AlertsWidget({
                configItem: 'alerts',
                description: null,
                strings: utils.createStringMap('day', 'days', 'prefix'),
                title: 'Alerts'
            });

            this.widget.render();
            this.widget.updateConfig({historySecs: 15 * 86400});

            this.$input = this.widget.$('input[name=history-secs]');
            this.$span = this.$input.siblings('span');
        });

        utils.testSuperProperties.call(this, {configItem: 'alerts', title: 'Alerts', description: null});

        it('should display the correct config', function() {
            expect(this.$input).toHaveValue('15');
            expect(this.$span).toHaveText('days');
        });

        it('should return the correct config', function() {
            this.$input.val('13.5');
            expect(this.widget.getConfig()).toEqual({historySecs: 13.5 * 86400});
        });

        it('should display singular day or plural days correctly', function() {
            this.$input.val('1');
            this.$input.trigger('change');
            expect(this.$span).toHaveText('day');
        });
    });

});
