define([
    'real/js/controls/enable-view',
    'test/test-utils',
    'jasmine-jquery'
], function(EnableView, utils) {

    describe('Enable control', function() {
        var stringObject = utils.createStringMap('loading', 'enable', 'disable', 'enabled', 'disabled');

        var checkState = function(state) {
            var $icon = this.$button.find('i');
            expect(this.$button).toContainText(state === 'loading' ? 'loading' : (state === 'enabled' ? 'disable' : 'enable'));
            expect(this.$label).toContainText(state === 'loading' ? '' : state);

            if (state === 'loading') {
                expect(this.$button).not.toHaveClass('btn-success');
                expect(this.$button).not.toHaveClass('btn-danger');
                expect($icon).toHaveLength(0);
                expect(this.enableView.getConfig()).toBeUndefined();
            } else if (state === 'enabled') {
                expect(this.$button).not.toHaveClass('btn-success');
                expect(this.$button).toHaveClass('btn-danger');
                expect($icon).toHaveClass('icon-remove');
                expect(this.enableView.getConfig()).toBeTruthy();
            } else if (state === 'disabled') {
                expect(this.$button).toHaveClass('btn-success');
                expect(this.$button).not.toHaveClass('btn-danger');
                expect($icon).toHaveClass('icon');
                expect(this.enableView.getConfig()).toBeFalsy();
            }
        };

        beforeEach(function() {
            this.enableView = new EnableView({
                enableIcon: 'icon',
                strings: stringObject
            });

            this.enableView.render();
            this.$button = this.enableView.$('button');
            this.$label = this.enableView.$('label');
        });

        it('should not be formatted before the config is loaded', function() {
            checkState.call(this, 'loading');
        });

        it('clicking the button should do nothing before the config is loaded', function() {
            this.$button.click();
            checkState.call(this, 'loading');
        });

        it('should correctly update with new config', function() {
            this.enableView.updateConfig(true);
            checkState.call(this, 'enabled');

            this.enableView.updateConfig(false);
            checkState.call(this, 'disabled');

            this.enableView.updateConfig(false);
            checkState.call(this, 'disabled');
        });

        it('should correctly handle clicking the toggle button', function() {
            this.enableView.updateConfig(true);
            this.$button.click();
            checkState.call(this, 'disabled');
            this.$button.click();
            checkState.call(this, 'enabled');
        });
    });

});