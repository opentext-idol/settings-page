/*
 * Copyright 2013-2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

define([
    'settings/js/widgets/database-widget',
    'test/server-widget-test-utils',
    'jasmine-jquery'
], function(DatabaseWidget, serverUtils) {

    describe('Database widget', function(initialConfig) {
        function testDatabaseCheckbox() {
            it('should use the username for the database name when the checkbox is checked', function() {
                var $checkbox = this.widget.$('input[type="checkbox"]');
                var $username = this.widget.$('input[name="username"]');
                var $database = this.widget.$('input[name="database"]');

                this.widget.updateConfig(_.defaults({
                    username: 'postgres',
                    database: 'postgres'
                }, initialConfig));

                expect($checkbox).toHaveProp('checked', true);
                expect($username).toHaveValue('postgres');
                expect($database).toHaveValue('postgres');

                $checkbox.prop('checked', false).trigger('change');
                $username.val('myUser').trigger('change');
                $database.val('siteadmin').trigger('change');

                expect($username).toHaveValue('myUser');
                expect($database).toHaveValue('siteadmin');

                $checkbox.prop('checked', true).trigger('change');

                expect($username).toHaveValue('myUser');
                expect($database).toHaveValue('myUser');
            });

            it('should fail client side validation on empty database', function() {
                var $database = this.widget.$('input[name="database"]');
                $database.val('');

                expect(this.widget.validateInputs()).toBe(false);
            });
        }

        describe('when it has an enabled widget', function() {
            var initialConfig = {
                enabled: true,
                database: 'myDatabase',
                host: 'myHost',
                password: '',
                passwordRedacted: true,
                port: 123,
                protocol: 'postgres',
                username: 'user'
            };

            beforeEach(function() {
                serverUtils.standardBeforeEach.call(this, {
                    WidgetConstructor: DatabaseWidget,
                    constructorOptions: _.extend({
                        canDisable: true,
                        strings: serverUtils.strings
                    }, serverUtils.defaultOptions),
                    initialConfig: initialConfig
                });
            });

            serverUtils.standardTests.call(this, {initialConfig: initialConfig});
            serverUtils.testDisablableServerShouldValidateFunction.call(this, {initialConfig: initialConfig});

            it('should display the correct config', function() {
                expect(this.widget.$('input[name=host]')).toHaveValue('myHost');
                expect(this.widget.$('input[name=port]')).toHaveValue('123');
                expect(this.widget.$('input[name=database]')).toHaveValue('myDatabase');
                expect(this.widget.$('input[name=username]')).toHaveValue('user');
                expect(this.widget.enableView.enabled).toBeTruthy();

                var passwordViewArgs = this.widget.passwordView.updateConfig.mostRecentCall.args[0];
                expect(passwordViewArgs.password).toEqual('');
                expect(passwordViewArgs.passwordRedacted).toBeTruthy();
            });

            it('should return the correct config', function() {
                expect(this.widget.getConfig()).toEqual(initialConfig)
            });

            testDatabaseCheckbox.call(this, initialConfig);
        });

        describe('without an enabled widget', function() {
            var initialConfig = {
                database: 'myDatabase',
                host: 'myHost',
                password: '',
                passwordRedacted: true,
                port: 123,
                protocol: 'postgres',
                username: 'user'
            };

            beforeEach(function() {
                serverUtils.standardBeforeEach.call(this, {
                    WidgetConstructor: DatabaseWidget,
                    constructorOptions: _.extend({
                        canDisable: false,
                        strings: serverUtils.strings
                    }, serverUtils.defaultOptions),
                    initialConfig: initialConfig
                });
            });

            serverUtils.standardTests.call(this, {initialConfig: initialConfig});

            it('should always validate on load', function() {
                expect(this.widget.shouldValidate()).toBeTruthy();
            });

            it('should display the correct config', function() {
                expect(this.widget.$('input[name=host]')).toHaveValue('myHost');
                expect(this.widget.$('input[name=port]')).toHaveValue('123');
                expect(this.widget.$('input[name=database]')).toHaveValue('myDatabase');
                expect(this.widget.$('input[name=username]')).toHaveValue('user');

                expect(this.widget.enableView).toBeUndefined();

                var passwordViewArgs = this.widget.passwordView.updateConfig.mostRecentCall.args[0];
                expect(passwordViewArgs.password).toEqual('');
                expect(passwordViewArgs.passwordRedacted).toBeTruthy();
            });

            it('should return the correct config', function() {
                this.widget.$('input[name=databas]').val('new_&&DatAbaSe');
                expect(this.widget.getConfig()).toEqual(_.extend({database: 'new_&&DatAbaSe'}, initialConfig));
            });

            it('should fail client side validation on empty host, username or password', function() {
                var $host = this.widget.$('input[name="host"]');
                var $username = this.widget.$('input[name="username"]');

                $host.val('');
                $username.val('');
                var isValid = this.widget.validateInputs();

                expect(isValid).toBeFalsy();
                expect(this.widget.$el).not.toHaveClass('success');
                expect(this.widget.$el).not.toHaveClass('error');

                expect($host.closest('.control-group')).toHaveClass('error');
                expect($host.siblings('.settings-client-validation')).not.toHaveClass('hide');
                expect($username.closest('.control-group')).toHaveClass('error');
                expect($username.siblings('.settings-client-validation')).not.toHaveClass('hide');
                expect(this.widget.$('input[name="database"]').closest('.control-group')).not.toHaveClass('error');
            });

            testDatabaseCheckbox.call(this, initialConfig);
        });
    });

});