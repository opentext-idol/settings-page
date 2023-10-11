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
    'settings/js/widgets/logging-widget',
    'test/test-utils',
    'sinon',
    'underscore',
    'jasmine-jquery'
], function(LoggingWidget, testUtils, sinon, _) {

    describe('Logging Widget', function() {
        beforeEach(function() {
            this.widget = new LoggingWidget({
                configItem: 'logging',
                description: null,
                testUrl: 'config/test',
                title: 'Logging',
                strings: {
                    compression: 'compression',
                    daily: 'daily',
                    gzip: 'gzip',
                    iconClass: 'iconClass',
                    invalidMaxSize: 'invalidMaxSize',
                    invalidMaxHistory: 'invalidMaxHistory',
                    invalidSyslogServer: 'invalidSyslogServer',
                    logFile: 'logFile',
                    logFileToggle: 'logFileToggle',
                    maxHistory: 'maxHistory',
                    maxSize: 'maxSize',
                    monthly: 'monthly',
                    none: 'none',
                    rolloverFrequency: 'rolloverFrequency',
                    syslog: 'syslog',
                    syslogHostPlaceholder: 'syslogHostPlaceholder',
                    syslogPortPlaceholder: 'syslogPortPlaceholder',
                    syslogToggle: 'syslogToggle',
                    testButton: ' testButton',
                    testFailure: ' testFailure',
                    testSuccess: _.identity,
                    zip: 'zip'
                }
            });

            this.widget.render();
        });

        describe('with log file configuration', function() {
            beforeEach(function() {
                this.widget.updateConfig({
                    logFile: {
                        compression: 'ZIP',
                        enabled: true,
                        maxHistory: 10,
                        maxSize: 10 * 1024 * 1024,
                        rolloverFrequency: 'DAILY'
                    },
                    syslog: {
                        host: '',
                        port: '',
                        enabled: false
                    }
                });
            });

            testUtils.testSuperProperties({
                configItem: 'logging',
                description: null,
                title: 'Logging'
            });

            it('should return the config correctly', function() {
                expect(this.widget.getConfig()).toEqual({
                    logFile: {
                        compression: 'ZIP',
                        enabled: true,
                        maxHistory: 10,
                        maxSize: 10 * 1024 * 1024,
                        rolloverFrequency: 'DAILY'
                    },
                    syslog: {
                        host: '',
                        port: 0,
                        enabled: false
                    }
                })
            });

            it('should update the config correctly', function() {
                expect(this.widget.$compression).toHaveValue('ZIP');
                expect(this.widget.$frequency).toHaveValue('DAILY');
                expect(this.widget.$maxHistory).toHaveValue('10');
                expect(this.widget.$maxSize).toHaveValue('10');
                expect(this.widget.$maxSizeUnit).toHaveValue(String(1024 * 1024));
                expect(this.widget.logFileToggle.getConfig()).toBe(true);

                expect(this.widget.$syslogHost).toHaveValue('');
                expect(this.widget.$syslogPort).toHaveValue('');
                expect(this.widget.syslogToggle.getConfig()).toBe(false);
            });

            it('should disable the test syslog button', function() {
                expect(this.widget.$testButton).toHaveProp('disabled', true);
            });

            describe('validation', function() {
                it('should be valid when given valid config', function() {
                    expect(this.widget.validateInputs()).toBe(true);
                });

                it('should be invalid if max history is not a whole number', function() {
                    this.widget.$maxHistory.val('5.6');

                    expect(this.widget.validateInputs()).toBe(false);
                });

                it('should be invalid if max history is less than 0', function() {
                    this.widget.$maxHistory.val('-1');

                    expect(this.widget.validateInputs()).toBe(false);
                });

                it('should be invalid if max history is greater than 99999', function() {
                    this.widget.$maxHistory.val('100000');

                    expect(this.widget.validateInputs()).toBe(false);
                });

                it('should be invalid if max size is not a whole number', function() {
                    this.widget.$maxSize.val('5.6');

                    expect(this.widget.validateInputs()).toBe(false);
                });

                it('should be invalid if max size is less than 0', function() {
                    this.widget.$maxSize.val('-1');

                    expect(this.widget.validateInputs()).toBe(false);
                });
            });
        });

        describe('with syslog configuration', function() {
            beforeEach(function() {
                this.widget.updateConfig({
                    logFile: {
                        compression: '',
                        enabled: false,
                        maxHistory: '',
                        maxSize: '',
                        rolloverFrequency: ''
                    },
                    syslog: {
                        host: 'localhost',
                        port: '56000',
                        enabled: true
                    }
                });
            });

            testUtils.testSuperProperties({
                configItem: 'logging',
                description: null,
                title: 'Logging'
            });

            it('should return the config correctly', function() {
                expect(this.widget.getConfig()).toEqual({
                    logFile: {
                        compression: null,
                        enabled: false,
                        maxHistory: 0,
                        maxSize: 1024,
                        rolloverFrequency: null
                    },
                    syslog: {
                        host: 'localhost',
                        port: 56000,
                        enabled: true
                    }
                })
            });

            it('should update the config correctly', function() {
                expect(this.widget.$compression).toHaveValue(null);
                expect(this.widget.$frequency).toHaveValue(null);
                expect(this.widget.$maxHistory).toHaveValue('');
                expect(this.widget.$maxSize).toHaveValue('1');
                expect(this.widget.$maxSizeUnit).toHaveValue('1024');
                expect(this.widget.logFileToggle.getConfig()).toBe(false);

                expect(this.widget.$syslogHost).toHaveValue('localhost');
                expect(this.widget.$syslogPort).toHaveValue('56000');
                expect(this.widget.syslogToggle.getConfig()).toBe(true);
            });

            it('should enable the test syslog button', function() {
                expect(this.widget.$testButton).toHaveProp('disabled', false);
            });

            describe('validation', function() {
                it('should be invalid if the host is blank', function() {
                    this.widget.$syslogHost.val('');

                    expect(this.widget.validateInputs()).toBe(false);
                });

                it('should be invalid if the port is not a whole number', function() {
                    this.widget.$syslogPort.val('5.6');

                    expect(this.widget.validateInputs()).toBe(false);
                });

                it('should be invalid if the port is less than 0', function() {
                    this.widget.$syslogPort.val('-1');

                    expect(this.widget.validateInputs()).toBe(false);
                });

                it('should be invalid if the port is greater than 65535', function() {
                    this.widget.$syslogPort.val('65536');

                    expect(this.widget.validateInputs()).toBe(false);
                });
            });

            describe('test syslog button', function() {
                beforeEach(function() {
                    this.server = sinon.fakeServer.create();
                    this.widget.$('[name="test-logging"]').click();
                });

                afterEach(function() {
                    this.server.restore();
                });

                it('should respond correctly to success responses', function() {
                    this.server.requests[0].respond(200, [], JSON.stringify({message: 'All good'}));

                    expect(this.widget.testRequest).toBeFalsy();
                    expect(this.widget.$testResponse).not.toHaveClass('hide');

                    // the success message function is the identity function
                    expect(this.widget.$testResponse).toHaveText('All good');

                    expect(this.widget.$testButton).toHaveProp('disabled', false);
                });

                it('should respond correctly to error responses', function() {
                    this.server.requests[0].respond(500);

                    expect(this.widget.testRequest).toBeFalsy();
                    expect(this.widget.$testResponse).not.toHaveClass('hide');
                    expect(this.widget.$testResponse).toHaveText('testFailure');
                    expect(this.widget.$testButton).toHaveProp('disabled', false);
                });

                it('should should set testRequest to a truthy value', function() {
                    expect(this.widget.testRequest).toBeTruthy();
                });

                it('should disable the test syslog button while testing', function() {
                    expect(this.widget.$testButton).toHaveProp('disabled', true);
                });
            });
        });
    })

});
