define([
    'settings/js/widget',
    'backbone',
    'js-utils/js/list-view',
    'text!settings/templates/widgets/paths-widget.html',
    'text!settings/templates/widgets/paths-widget-row.html'
], function(Widget, Backbone, ListView, template, itemTemplate) {

    return Widget.extend({
        itemTemplate: _.template(itemTemplate),
        template: _.template(template),

        events: _.extend({
            'change [name="path"]': function(e) {
                var $input = $(e.currentTarget);
                var cid = $input.closest('[data-cid]').data('cid');
                this.collection.get(cid).set('path', $input.val());
            },
            'click [name="remove-path"]': function(e) {
                var cid = $(e.currentTarget).closest('[data-cid]').data('cid');
                this.collection.remove(this.collection.get(cid));
            },
            'click [name="add-path"]': function() {
                this.collection.add({path: ''});
            }
        }, Widget.prototype.events),

        initialize: function(options) {
            Widget.prototype.initialize.apply(this, arguments);
            this.collection = new Backbone.Collection();

            this.listView = new ListView({
                collection: this.collection,
                itemTemplate: this.itemTemplate,
                itemTemplateOptions: {strings: this.strings}
            });

            this.listenTo(this.collection, 'add remove reset', this.updateRemoveButtons);
        },

        render: function() {
            Widget.prototype.render.call(this);
            this.$content.append(this.template({strings: this.strings}));
            this.listView.setElement(this.$('.path-list')).render();
            this.updateRemoveButtons();
        },

        getConfig: function() {
            return {paths: this.collection.pluck('path')};
        },

        updateConfig: function(config) {
            Widget.prototype.updateConfig.apply(this, arguments);

            this.collection.reset(_.map(config.paths, function(path) {
                return {path: path};
            }));
        },

        updateRemoveButtons: function() {
            this.$('[name="remove-path"]').prop('disabled', this.collection.length === 1);
        },

        validateInputs: function() {
            var isValid = true;

            this.collection.each(function(model) {
                if (!model.get('path')) {
                    isValid = false;
                    var $item = this.listView.$('[data-cid="' + model.cid + '"]');
                    $item.addClass('error');
                    this.updateInputValidation($item.find('input'), false);
                }
            }, this);

            return isValid;
        }
    });

});