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
    'settings/js/widgets/port-widget',
    'test/test-utils',
    'jasmine-jquery'
], function(PortWidget, utils) {

    describe('Port widget', function() {
        beforeEach(function() {
            this.widget = new PortWidget({
                configItem: 'thingThatNeedsAPort',
                description: 'Choose a port',
                strings: {
                    label: 'Port:'
                },
                title: 'Port To Thing'
            });

            this.widget.render();
            this.widget.updateConfig({port: 666});
            this.$port = this.widget.$('input[name="port"]');
        });

        utils.testSuperProperties.call(this, {configItem: 'thingThatNeedsAPort', title: 'Port To Thing', description: 'Choose a port'});

        it('should display the correct config', function() {
            expect(this.$port).toHaveValue('666');
        });

        it('should return the correct config', function() {
            this.$port.val(42);
            expect(this.widget.getConfig()).toEqual({port: 42});
        });

        it('should fail client side validation on blank port', function() {
            var $controlGroup = this.$port.closest('.control-group');
            this.$port.val('');
            var isValid = this.widget.validateInputs();

            expect(isValid).toBeFalsy();
            expect($controlGroup).toHaveClass('error');
        });

        it('should fail client side validation on port equal to zero', function() {
            var $controlGroup = this.$port.closest('.control-group');
            this.$port.val(0);
            var isValid = this.widget.validateInputs();

            expect(isValid).toBeFalsy();
            expect($controlGroup).toHaveClass('error');
        });

        it('should fail client side validation on port less than zero', function() {
            var $controlGroup = this.$port.closest('.control-group');
            this.$port.val(-10);
            var isValid = this.widget.validateInputs();

            expect(isValid).toBeFalsy();
            expect($controlGroup).toHaveClass('error');
        });

        it('should fail client side validation on port greater than 65536', function() {
            var $controlGroup = this.$port.closest('.control-group');
            this.$port.val(65536 + 10);
            var isValid = this.widget.validateInputs();

            expect(isValid).toBeFalsy();
            expect($controlGroup).toHaveClass('error');
        });

        it('should pass client side validation on port greater than zero but less than 65536', function() {
            var $controlGroup = this.$port.closest('.control-group');
            this.$port.val(101);
            var isValid = this.widget.validateInputs();

            expect(isValid).toBeTruthy();
            expect($controlGroup).not.toHaveClass('error');
        });

        it('should remove validation formatting on input change', function() {
            var $controlGroup = this.$port.closest('.control-group');
            this.$port.val('');
            this.$port.val(101).trigger('change');

            expect($controlGroup).not.toHaveClass('error');
        });
    });

});
