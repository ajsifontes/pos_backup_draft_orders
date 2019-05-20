/******************************************************************************
    Point Of Sale - Backup Draft Orders module for OpenERP
    Copyright (C) 2014 GRAP (http://www.grap.coop)
    @author Julien WESTE
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
******************************************************************************/

openerp.pos_backup_draft_orders = function (instance) {
    module = instance.point_of_sale;
    _t = instance.web._t;

    /*************************************************************************
        Overload : PosWidget to include button in PosOrderHeaderWidget widget
        to backup draft orders
    */

    module.PaypadButtonWidget = module.PosBaseWidget.extend({
        template: 'PrintOrderButtonWidget',
        init: function(parent, options){
            this._super(parent, options);
            this.cashRegister = options.cashRegister;
        },
        renderElement: function() {
            var self = this;
            this._super();

            this.$el.click(function(){
                self.backup_order();
            });
        },
        backup_order: function() {
            var order = this.pos.get('selectedOrder');
            this.pos.push_order(order.exportAsJSON());
            this.pos_widget.screen_selector.set_current_screen('receipt');
            this.pos.get('selectedOrder').destroy();
        },
    });

};

