/*
 * Copyright 2013-2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
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