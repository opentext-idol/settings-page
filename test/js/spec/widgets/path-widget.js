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
    'settings/js/widgets/path-widget',
    'test/test-utils',
    'jasmine-jquery'
], function(PathWidget, utils) {

    describe('Path widget', function() {
        beforeEach(function() {
            this.widget = new PathWidget({
                configItem: 'thingThatNeedsAPath',
                description: 'Choose a path',
                strings: {
                    label: 'Path:'
                },
                title: 'Path To Thing'
            });

            this.widget.render();
            this.widget.updateConfig({path: '/opt/thing'});
            this.$path = this.widget.$('input[name="path"]');
        });

        utils.testSuperProperties.call(this, {configItem: 'thingThatNeedsAPath', title: 'Path To Thing', description: 'Choose a path'});

        it('should display the correct config', function() {
            expect(this.$path).toHaveValue('/opt/thing');
        });

        it('should return the correct config', function() {
            this.$path.val('C:\\things');
            expect(this.widget.getConfig()).toEqual({path: 'C:\\things'});
        });

        it('should fail client side validation on blank path', function() {
            var $controlGroup = this.$path.closest('.control-group');
            this.$path.val('');
            var isValid = this.widget.validateInputs();

            expect(isValid).toBeFalsy();
            expect($controlGroup).toHaveClass('error');

            this.$path.val('/opt').trigger('change');

            expect($controlGroup).not.toHaveClass('error');
        });
    });

});
