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
    'underscore'
], function() {

    return {
        createStringMap: function() {
            var obj = {};

            _.each(arguments, function(arg) {
                obj[arg] = arg;
            });

            return obj;
        },
        testSuperProperties: function(options) {
            var configItem = options.configItem;
            var title = options.title;
            var description = options.description;

            it('should have a configItem, title and description', function() {
                expect(this.widget.configItem).toEqual(configItem);

                var $title = this.widget.$('h3');
                expect($title).toHaveLength(1);
                expect($title).toHaveText(title);

                var $description = this.widget.$('p');

                if (description) {
                    expect($description).toHaveLength(1);
                    expect($description).toHaveText(description);
                } else {
                    expect($description).toHaveLength(0);
                }
            });
        }
    }

});
