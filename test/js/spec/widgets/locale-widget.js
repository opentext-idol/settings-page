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
    'settings/js/widgets/locale-widget',
    'test/test-utils',
    'jasmine-jquery'
], function(LocaleWidget, utils) {

    describe('Locale widget', function() {
        beforeEach(function() {
            this.widget = new LocaleWidget({
                configItem: 'locale',
                description: null,
                locales: {
                    'en_GB': 'English (UK)',
                    'en_US': 'English (US)'
                },
                strings: utils.createStringMap('prefix'),
                title: 'Locale Selection'
            });

            this.widget.render();
            this.widget.updateConfig('en_GB');
            this.$select = this.widget.$('select[name=locale]');
        });

        utils.testSuperProperties.call(this, {configItem: 'locale', title: 'Locale Selection', description: null});

        it('should render locale options correctly', function() {
            var $options = this.$select.children('option');
            expect($options).toHaveLength(2);

            var $GB = $options.filter('[value="en_GB"]');
            expect($GB).toHaveLength(1);
            expect($GB).toHaveText('English (UK)');

            var $US = $options.filter('[value="en_US"]');
            expect($US).toHaveLength(1);
            expect($US).toHaveText('English (US)');
        });

        it('should display the correct config', function() {
            expect(this.$select).toHaveValue('en_GB');
        });

        it('should return the correct config', function() {
            this.$select.val('en_US');
            expect(this.widget.getConfig()).toEqual('en_US');
        });
    });

});
