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
    'real/js/models/security-types-model',
    'sinon'
], function(SecurityTypesModel) {

    describe('Security types model', function() {
        beforeEach(function() {
            jasmine.addMatchers({
                toContainString: function() {
                    return {
                        compare: function(actual, target) {
                            var result = {};

                            result.pass = _.contains(actual, target);

                            result.message = 'Expected "' + JSON.stringify(actual) +
                                    result.pass ? '' : ' not ' +
                                    '" to contain "' + target + '"';

                            return result;
                        }
                    }
                }
            });

            this.server = sinon.fakeServer.create();

            this.model = new SecurityTypesModel({}, {
                url: '/securitytypes'
            });
        });

        afterEach(function() {
            this.server.restore();
        });

        it('should parse correctly, removing default login from the response', function() {
            this.model.fetch();

            expect(this.server.requests.length).toEqual(1);

            this.server.requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({
                securityTypes: ['default', 'autonomy', 'secure-login-v1.0.1']
            }));

            var types = this.model.get('securityTypes');
            expect(types.length).toEqual(2);
            expect(types).toContainString('autonomy');
            expect(types).toContainString('secure-login-v1.0.1');
            expect(types).not.toContainString('default');
        });

        it('should only update attributes with the response from the last request', function() {
            this.model.set({
                securityTypes: ['yoda']
            });

            this.model.fetch();
            this.model.fetch();

            expect(this.server.requests.length).toEqual(2);

            // as of sinon 1.9.0 we can't respond to an aborted request
            expect(this.server.requests[0].readyState).toBe(0);

            expect(this.model.get('securityTypes').length).toEqual(1);
            expect(this.model.get('securityTypes')[0]).toEqual('yoda');

            this.server.requests[1].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({
                securityTypes: ['bobs-security-protocol']
            }));

            expect(this.model.get('securityTypes').length).toEqual(1);
            expect(this.model.get('securityTypes')[0]).toEqual('bobs-security-protocol');
        });
    });

});
