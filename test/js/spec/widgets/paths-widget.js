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
    'settings/js/widgets/paths-widget',
    'js-whatever/js/list-view',
    'test/test-utils',
    'jasmine-jquery'
], function(PathsWidget, ListView, utils) {

    describe('Paths widget', function() {
        beforeEach(function() {
            this.widget = new PathsWidget({
                configItem: 'pathThing',
                description: 'Choose some paths',
                strings: {
                    addPath: 'Add a Path'
                },
                title: 'Thing Paths'
            });

            this.listView = ListView.instances[0];
            this.collection = this.listView.collection;
            this.widget.render();

            this.widget.updateConfig({paths: [
                '/opt/autonomy',
                '/opt/hp'
            ]});
        });

        afterEach(function() {
            ListView.reset();
        });

        utils.testSuperProperties.call(this, {
            configItem: 'pathThing',
            description: 'Choose some paths',
            title: 'Thing Paths'
        });

        it('should update the collection backing the ListView with the paths passed to updateConfig', function() {
            expect(this.collection.length).toBe(2);
            expect(this.collection.at(0).get('path')).toBe('/opt/autonomy');
            expect(this.collection.at(1).get('path')).toBe('/opt/hp');
        });

        it('should add a new item to the collection on clicking the "add path" button', function() {
            this.widget.$('[name="add-path"]').click();

            expect(this.collection.length).toBe(3);
            expect(this.collection.at(0).get('path')).toBe('/opt/autonomy');
            expect(this.collection.at(1).get('path')).toBe('/opt/hp');
            expect(this.collection.at(2).get('path')).toBe('');
        });

        it('should remove the correct item from the collection on clicking a minus button', function() {
            var cid = this.collection.at(0).cid;

            // Add the remove button since the list view handles this
            this.listView.$el.append('<div data-cid="' + cid + '"><button name="remove-path"></button></div>');
            this.widget.$('[data-cid="' + cid + '"] [name="remove-path"]').click();

            expect(this.collection.length).toBe(1);
            expect(this.collection.get(cid)).toBeUndefined();
            expect(this.collection.at(0).get('path')).toBe('/opt/hp');
        });

        it('should disable the remove button if there is only one path in the list', function() {
            var cid = this.collection.at(0).cid;

            // Add the remove button since the list view handles this
            this.listView.$el.append('<div data-cid="' + cid + '"><button name="remove-path"></button></div>');
            var $removeButton = this.widget.$('[data-cid="' + cid + '"] [name="remove-path"]').click();

            // There is only one path left in the collection, so the remove button should be disabled
            expect($removeButton).toHaveProp('disabled', true);
        });

        it('should update the paths in the collection on input change events', function() {
            var model = this.collection.at(0);
            var cid = model.cid;

            // Add the path input since the list view handles this
            this.listView.$el.append('<div data-cid="' + cid + '"><input name="path"></div>');
            this.widget.$('[data-cid="' + cid + '"] input').val('/opt/yodas-stuff').change();

            expect(model.get('path')).toBe('/opt/yodas-stuff');
        });

        it('should return the correct config from getConfig', function() {
            this.widget.$('[name="add-path"]').click();
            var cid = this.collection.at(2).cid;

            // Add the path input since the list view handles this
            this.listView.$el.append('<div data-cid="' + cid + '"><input name="path"></div>');
            this.widget.$('[data-cid="' + cid + '"] input').val('/opt/yodas-stuff').change();

            expect(this.widget.getConfig()).toEqual({paths: [
                '/opt/autonomy',
                '/opt/hp',
                '/opt/yodas-stuff'
            ]});
        });

        it('should fail client side validation if any of the paths are blank', function() {
            var cid = this.collection.at(0).cid;

            // Add the path input since the list view handles this
            this.listView.$el.append('<div class="form-group" data-cid="' + cid + '"><input name="path"></div>');
            var $input = this.widget.$('[data-cid="' + cid + '"] input').val('').change();

            expect(this.widget.validateInputs()).toBe(false);
            expect($input.closest('.form-group')).toHaveClass('has-error');
        });
    });

});
