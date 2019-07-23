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
    var QWeb = instance.web.qweb,
    module = instance.point_of_sale;
    _t = instance.web._t;

    /*************************************************************************
        Overload : PaymentWidget to include button in PosOrderHeaderWidget widget
        to backup draft orders
    */

    module.PaypadWidget = module.PosBaseWidget.extend({
        template: 'PaypadWidget',
        init: function(parent, options){
            this._super(parent, options);
            this.cashRegister = options.cashRegister;
        },
        renderElement: function() {
            var self = this;
            this._super();
            this.pos.get('cashRegisters').each(function(cashRegister) {
                var button = new module.PaypadButtonWidget(self,{
                    pos: self.pos,
                    pos_widget : self.pos_widget,
                    cashRegister: cashRegister,
                });
                button.insertAfter(self.$el);
                self.$el.find("#reservar").click(function(){
                  self.pos_widget.screen_selector.set_current_screen('receipt');
                  self.$el.find("#reservar").attr("disabled","disabled");
                });
            });
        },
    });

    module.ReceiptScreenWidget = module.ScreenWidget.extend({
        template: 'ReceiptScreenWidget',

        show_numpad:     true,
        show_leftpane:   true,

        init: function(parent, options) {
            this._super(parent,options);
            this.model = options.model;
            this.user = this.pos.get('user');
            this.company = this.pos.get('company');
            this.shop_obj = this.pos.get('shop');
            this.cashRegister = options.cashRegister;
        },
        renderElement: function() {
            this._super();
            this.pos.bind('change:selectedOrder', this.change_selected_order, this);
            this.change_selected_order();
        },
        show: function(){
            this._super();
            var self = this;

            this.add_action_button({
                    label: _t('Print'),
                    icon: '/point_of_sale/static/src/img/icons/png48/printer.png',
                    click: function(){
                      self.print();
                    },
                });

            this.add_action_button({
                    label: _t('Next Order'),
                    icon: '/point_of_sale/static/src/img/icons/png48/go-next.png',
                    click: function() {
                      self.backup_order();
                      self.finishOrder();
                      $("#reservar").removeAttr("disabled");
                    },
                });
        },
        print: function() {
            window.print();
        },
        finishOrder: function() {
            this.pos.get('selectedOrder').destroy();
        },
        change_selected_order: function() {
            if (this.currentOrderLines)
                this.currentOrderLines.unbind();
            this.currentOrderLines = (this.pos.get('selectedOrder')).get('orderLines');
            this.currentOrderLines.bind('add', this.refresh, this);
            this.currentOrderLines.bind('change', this.refresh, this);
            this.currentOrderLines.bind('remove', this.refresh, this);
            if (this.currentPaymentLines)
                this.currentPaymentLines.unbind();
            this.currentPaymentLines = (this.pos.get('selectedOrder')).get('paymentLines');
            this.currentPaymentLines.bind('all', this.refresh, this);
            this.refresh();
        },
        refresh: function() {
            this.currentOrder = this.pos.get('selectedOrder');
            $('.pos-receipt-container', this.$el).html(QWeb.render('PosTicket',{widget:this}));
            this.$el.find("#barcode").barcode(this.currentOrder.attributes.name.split(' ')[1],'code128',{barWidth:2.9, barHeight:70,fontSize:18});
        },
        backup_order: function() {
            var order = this.pos.get('selectedOrder');
            this.pos.push_order(order.exportAsJSON());
        },
    });

};
