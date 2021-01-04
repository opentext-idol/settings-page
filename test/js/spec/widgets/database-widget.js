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
    'settings/js/widgets/database-widget',
    'test/server-widget-test-utils',
    'jasmine-jquery'
], function(DatabaseWidget, serverUtils) {

    describe('Database widget', function() {
        function testDatabaseCheckbox(initialConfig) {
            it('should use the username for the database name when the checkbox is checked', function() {
                var $checkbox = this.widget.$('input[type="checkbox"]');
                var $username = this.widget.$('input[name="username"]');
                var $database = this.widget.$('input[name="database"]');

                this.widget.updateConfig(_.defaults({
                    username: 'postgres',
                    url: 'jdbc:postgresql://myHost:123/postgres'
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

        function testPostgres(initialConfig) {
            it('should display the correct config', function() {
                expect(this.widget.$('input[name=host]')).toHaveValue('myHost');
                expect(this.widget.$('input[name=port]')).toHaveValue('123');
                expect(this.widget.$('input[name=database]')).toHaveValue('myDatabase');
                expect(this.widget.$('input[name=username]')).toHaveValue('user');

                expect(this.widget.enableView).toBeUndefined();

                var passwordViewArgs = this.widget.passwordView.updateConfig.calls.mostRecent().args[0];
                expect(passwordViewArgs.password).toEqual('');
                expect(passwordViewArgs.passwordRedacted).toBeTruthy();
            });

            it('should return the correct config', function() {
                this.widget.$('input[name=database]').val('new_&&DatAbaSe');
                expect(this.widget.getConfig()).toEqual({
                    platform: 'postgres',
                    hibernateDialect: 'org.hibernate.dialect.PostgreSQL82Dialect',
                    driverClassName: 'org.postgresql.Driver',
                    url: 'jdbc:postgresql://myHost:123/new_&&DatAbaSe',
                    password: '',
                    passwordRedacted: true,
                    username: 'user'
                });
            });

            it('should fail client side validation on empty host, username or password', function() {
                var $host = this.widget.$('input[name="host"]');
                var $username = this.widget.$('input[name="username"]');

                $host.val('');
                $username.val('');
                var isValid = this.widget.validateInputs();

                expect(isValid).toBeFalsy();
                expect(this.widget.$el).not.toHaveClass('has-success');
                expect(this.widget.$el).not.toHaveClass('has-error');

                expect($host.closest('.form-group')).toHaveClass('has-error');
                expect($host.siblings('.settings-client-validation')).not.toHaveClass('hide');
                expect($username.closest('.form-group')).toHaveClass('has-error');
                expect($username.siblings('.settings-client-validation')).not.toHaveClass('hide');
                expect(this.widget.$('input[name="database"]').closest('.form-group')).not.toHaveClass('has-error');
            });

            testDatabaseCheckbox.call(this, initialConfig);
        }

        describe('with a postgres widget', function() {
            var initialConfig = {
                platform: 'postgres',
                hibernateDialect: 'org.hibernate.dialect.PostgreSQL82Dialect',
                driverClassName: 'org.postgresql.Driver',
                url: 'jdbc:postgresql://myHost:123/myDatabase',
                password: '',
                passwordRedacted: true,
                username: 'user'
            };

            beforeEach(function() {
                serverUtils.standardBeforeEach.call(this, {
                    WidgetConstructor: DatabaseWidget,
                    constructorOptions: _.extend({
                        canDisable: false,
                        databaseType: 'postgres',
                        strings: serverUtils.strings
                    }, serverUtils.defaultOptions),
                    initialConfig: initialConfig
                });
            });

            serverUtils.standardTests.call(this, {initialConfig: initialConfig});

            it('should always validate on load', function() {
                expect(this.widget.shouldValidate()).toBeTruthy();
            });

            it('should not display database type dropdown', function() {
                expect(this.widget.$('.database-type-selection')).toHaveClass('hide');
            });

            it('should display postgres datasource widget', function() {
                expect(this.widget.$('.database-config')).not.toHaveClass('hide');
            });

            testPostgres.call(this, initialConfig);
        });

        describe('with a selectable widget', function() {
            var initialConfig = {
                password: '',
                passwordRedacted: true,
                username: 'user'
            };

            beforeEach(function() {
                serverUtils.standardBeforeEach.call(this, {
                    WidgetConstructor: DatabaseWidget,
                    constructorOptions: _.extend({
                        canDisable: false,
                        databaseName: 'an-application',
                        strings: serverUtils.strings
                    }, serverUtils.defaultOptions),
                    initialConfig: initialConfig
                });
            });

            it('should always validate on load', function() {
                expect(this.widget.shouldValidate()).toBeTruthy();
            });

            it('should display database type dropdown', function() {
                expect(this.widget.$('.database-type-selection')).not.toHaveClass('hide');
            });

            it('should not display datasource widget', function() {
                expect(this.widget.$('.database-config')).toHaveClass('hide');
            });

            it('should return the correct h2 config', function() {
                expect(this.widget.getConfig()).toEqual({
                    platform: 'h2',
                    hibernateDialect: 'org.hibernate.dialect.H2Dialect',
                    driverClassName: 'org.h2.Driver',
                    url: 'jdbc:h2:mem:an-application;DB_CLOSE_ON_EXIT=FALSE',
                    password: '',
                    passwordRedacted: false,
                    username: 'sa'
                });
            });

            describe('after selecting postgres', function() {
                var postgresConfig = {
                    platform: 'postgres',
                    hibernateDialect: 'org.hibernate.dialect.PostgreSQL82Dialect',
                    driverClassName: 'org.postgresql.Driver',
                    url: 'jdbc:postgresql://myHost:123/myDatabase',
                    password: '',
                    passwordRedacted: true,
                    username: 'user'
                };

                beforeEach(function() {
                    this.widget.$('.database-type-input option[value=h2]').prop('selected', false);
                    this.widget.$('.database-type-input option[value=postgres]').prop('selected', true);
                    this.widget.updateConfig(postgresConfig);
                });

                serverUtils.standardTests.call(this, {initialConfig: postgresConfig});
                testPostgres.call(this, postgresConfig);
            });
        });
    });

});
