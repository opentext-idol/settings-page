define([
    'real/js/models/security-types',
    'sinon'
], function(SecurityTypesModel) {

    describe('Security types model', function() {
        beforeEach(function() {
            this.addMatchers({
                toContainString: function(target) {
                    this.message = function() {
                        return 'Expected "' + JSON.stringify(this.actual) + '" to contain "' + target + '"';
                    };

                    return _.contains(this.actual, target);
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

            this.server.requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({
                securityTypes: ['autonomy', 'secure-login-v1.0.1']
            }));

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