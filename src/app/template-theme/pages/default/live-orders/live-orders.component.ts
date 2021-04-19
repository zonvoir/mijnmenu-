import { Component, OnInit, ViewEncapsulation, AfterViewInit, Input } from '@angular/core';
import { Helpers } from '../../../../helpers';
import { ScriptLoaderService } from '../../../../_services/script-loader.service';
import { ModalDismissReasons, NgbDateStruct, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators, FormBuilder } from "@angular/forms";
import { TableService } from '../../../../common/services/table.service'
import { Table } from '../../../../common/models/table'
import { RestaurantService } from '../../../../common/services/restaurant.service'
import { SocketService } from '../../../../common/services/socket.service';
import { Action } from '../../../../common/models/action';
import { Event } from '../../../../common/models/event';

@Component({
    selector: 'app-live-orders',
    templateUrl: "./live-orders.component.html",
    encapsulation: ViewEncapsulation.None
})
export class LiveOrdersComponent implements OnInit {
    RestaurantOrders: any;
    SelectedRestaurant: any;
    action = Action;
    event = Event;
    //user: User;
    messages = [];
    messageContent: string;
    ioConnection: any;
    

    constructor(private _tableService: TableService, private socketService: SocketService) { }

    ngOnInit() {
        this.RestaurantOrders = [];
        this.GetRestaurantOrders();
        this.initIoConnection();
    }

    private initIoConnection(): void {
        this.socketService.initSocket();
        if (localStorage.getItem('SelectedRestaurant') != "undefined"){
            this.SelectedRestaurant = JSON.parse(localStorage.getItem('SelectedRestaurant'));
            if (this.SelectedRestaurant != null) {
                this.ioConnection = this.socketService.onOrder(this.SelectedRestaurant.Restaurant._id)
                .subscribe((message: any) => {
                  console.log('message');
                  console.log(message);
                    this.wbGetRestaurantOrders();
                    this.messages.push(message);
                });
            }
        }
        
    
        this.socketService.onEvent(this.event.CONNECT)
          .subscribe(() => {
            console.log('connected');
          });
          
        this.socketService.onEvent(this.event.DISCONNECT)
          .subscribe(() => {
            console.log('disconnected');
          });
    }

    GetRestaurantOrders() {
        if (localStorage.getItem('SelectedRestaurant') != "undefined")
            this.SelectedRestaurant = JSON.parse(localStorage.getItem('SelectedRestaurant'));
        if (this.SelectedRestaurant != null) {
            Helpers.setLoading(true);
            this.RestaurantOrders = [];
            this._tableService.getUserOrderByRestaurant(this.SelectedRestaurant.Restaurant._id).subscribe(
                data => {

                    var orders = [];
                    // Need to change This 

                    data.data.forEach(function (value) {
                      value.OrderDetails.OrderdItems.forEach(function (order) {
                        orders.push({ ReservationId: value._id, Order: order, RestaurnatName: value.RestaurantName, OrderStatus: order.ItemStatus })
                      });
                    })
                  this.RestaurantOrders = orders;
                 
                  Helpers.setLoading(false);
                },
                error => {
                    Helpers.setLoading(false);
                });
        }
        console.log('this.RestaurantOrders 01');
        console.log(this.RestaurantOrders);
    }



    wbGetRestaurantOrders() {
      if (localStorage.getItem('SelectedRestaurant') != "undefined")
          this.SelectedRestaurant = JSON.parse(localStorage.getItem('SelectedRestaurant'));
      if (this.SelectedRestaurant != null) {
        Helpers.setLoading(false);
          this.RestaurantOrders = [];
          this._tableService.getUserOrderByRestaurant(this.SelectedRestaurant.Restaurant._id).subscribe(
              data => {

                  var orders = [];
                  // Need to change This 

                  data.data.forEach(function (value) {
                    value.OrderDetails.OrderdItems.forEach(function (order) {
                      orders.push({ ReservationId: value._id, Order: order, RestaurnatName: value.RestaurantName, OrderStatus: order.ItemStatus })
                    });
                  })
                this.RestaurantOrders = orders;
                console.log('this.RestaurantOrders');
                console.log(this.RestaurantOrders);
                Helpers.setLoading(false);
              },
              error => {
                  Helpers.setLoading(false);
              });
      }
      console.log('this.RestaurantOrders 02');
        console.log(this.RestaurantOrders);
  }

    /*public sendMessage(order, status): void {
        if (!message) {
          return;
        }
    
        this.socketService.send({
          from: this.user,
          content: message
        });
        this.messageContent = null;
    }*/
    
    /*public sendNotification(params: any, action: Action): void {
        let message: Message;
    
        if (action === Action.JOINED) {
          message = {
            from: this.user,
            action: action
          }
        } else if (action === Action.RENAME) {
          message = {
            action: action,
            content: {
              username: this.user.name,
              previousUsername: params.previousUsername
            }
          };
        }
    
        this.socketService.send(message);
    }*/

    public sendNotification(params: any, action: Action): void {
        let message: any;
    
        if (action === Action.JOINED) {
          message = {
            from: 'pankaj',
            action: action
          }
        } else if (action === Action.RENAME) {
          message = {
            action: action,
            content: {
              username: 'pankaj',
              previousUsername: params.previousUsername
            }
          };
        }
    
        this.socketService.updateOrder(message);
    }

    updateReservationStatus(order, status) {
        Helpers.setLoading(true);
        var orderData = { _id: order.ReservationId, OrderStatus: status, ItemId: order.Order._id }
        /*this.socketService.onOrder(orderData).subscribe(
          data => {
            console.log('data');
            console.log(data);
            console.log('pankaj you are rock');
          },
          error => {

          }
        )*/
                
                
        this._tableService.updateOrderItemStatus(orderData).subscribe(
            data => {
                this.wbGetRestaurantOrders();
            },
            error => {
                Helpers.setLoading(false);
            });
    }
}
