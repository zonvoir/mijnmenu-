import { Component, EventEmitter, OnInit, ChangeDetectorRef, ViewEncapsulation, AfterViewInit, Input } from '@angular/core';
import { Helpers } from '../../../helpers';
import { RestaurantService } from '../../../common/services/restaurant.service'
import { RestaurantCategoryService } from '../../../common/services/restaurant-category.service'
import { Restaurant } from '../../../common/models/restaurant'
import { ModalDismissReasons, NgbDateStruct, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder } from "@angular/forms";
import { MenuService } from '../../../common/services/menu.service'
import { Router } from "@angular/router";
import { MenuComponent } from '../../pages/default/menu/menu.component';
import { DaterangepickerConfig } from 'ng2-daterangepicker';  
declare let mLayout: any;

@Component({
    selector: "app-aside-nav",
    templateUrl: "./aside-nav.component.html",
    encapsulation: ViewEncapsulation.None,
    styles : ['.search-icon{ display:none;}'],
})
export class AsideNavComponent implements OnInit, AfterViewInit {
    modalReference: NgbModalRef;
    openingHours : any;
    ErrorModel: any;
    Restaurants: any;
    DetailData: any;
    RestaurantCategories: any;
    restaurantModel: Restaurant;
    IsSubmit: boolean;
    frmData: FormData;
    RestaurantImages: any;
    fileToUpload: FileList = null;
    SelectedRestaurant: any;
    dietaryFormArray: any;
    selectedDietaryArray: any;
    gpPlaceSelected = false;

    public options: any = {
      alwaysShowCalendars: false,
      timePicker: true
    };
    //menuComponent: MenuComponent;
  constructor(
        private cd: ChangeDetectorRef,
        private modalService: NgbModal,
        private _router: Router,
        private _menuService: MenuService,
        private _restaurantService: RestaurantService,
        private _restaurantCategoryService: RestaurantCategoryService
    ) {
        this.DetailData = null;
        this.IsSubmit = false;

        //this.daterangepickerOptions.settings = {
        //  alwaysShowCalendars: false
        //};

        //this.daterangepickerOptions.skipCSS = true;
    }

    ngOnInit() {
        //this.menuComponent = new MenuComponent(this._menuService, this.cd);
        this.selectedDietaryArray = [];
        this.openingHours = [];
        this.loadRestaurantData();
        this.loadRestaurantCategoryData();
        this.getDietaryType();
        this.restaurantModel = new Restaurant();
        this.restaurantModel.RestaurantCategoryId = "0";
        this.frmData = new FormData();
        if (localStorage.getItem('SelectedRestaurant') != "undefined")
        this.SelectedRestaurant = JSON.parse(localStorage.getItem('SelectedRestaurant'));
     
  }

  public selectedDate(value: any, datepicker?: any) {
    debugger;
    datepicker.start = value.start;
    datepicker.end = value.end;
    //this.daterange.start = value.start;
    //this.daterange.end = value.end;
    //this.daterange.label = value.label;

    //this.offerModel.StartDate = this.daterange.start._d;
    //this.offerModel.EndDate = this.daterange.end._d;
  }

    loadRestaurantCategoryData() {
        Helpers.setLoading(true);
        this._restaurantCategoryService.getAllRestaurantCategory().subscribe(
            data => {
                console.log(data.data);
                // data.data.map((category) => {
                //     console.log(category);
                // });
                // data.data.sort((a, b) => {
                //     return a.Name - b.Name;
                // });
                this.RestaurantCategories = data.data;
                console.log(this.RestaurantCategories);
                Helpers.setLoading(false);
            },
            error => {
                Helpers.setLoading(false);
            });

    }

    loadRestaurantData() {
        Helpers.setLoading(true);
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        this._restaurantService.getAllRestaurantByUser(currentUser.data._id).subscribe(
            data => {
              this.Restaurants = data.data;
              console.log("this.Restaurants");
              console.log(this.Restaurants);
                if (this.SelectedRestaurant == null) {
                    this.SelectedRestaurant = this.Restaurants[0];
                    localStorage.setItem('SelectedRestaurant', JSON.stringify(this.SelectedRestaurant));
                }
                if (this.IsSubmit) {
                    this.modalReference.close();
                    $('#AddNewRest').hide();
                    $('#myRestaurant').show();
                    $('#ViewRetaurant').show();
                }
                Helpers.setLoading(false);
            },
            error => {
                Helpers.setLoading(false);
            });

    }

    public userSettings2: any = {
        showRecentSearch: true,
        geoCountryRestriction: ['nl']
        //geoTypes: ['establishment'],
    };

    autoCompleteCallback1(selectedData: any) {
        //do any necessery stuff.
        selectedData = selectedData.data;
        console.log('selectedData');
        console.log(selectedData);
        // $('#search_places').val(selectedData.name);
        this.gpPlaceSelected = true;
        this.restaurantModel.Lat = selectedData.geometry.location.lat;
        this.restaurantModel.Long = selectedData.geometry.location.lng;
        this.restaurantModel.Place_id = selectedData.place_id;
        this.restaurantModel.Name = selectedData.name;
        // this.restaurantModel.Description = selectedData.description;
        this.restaurantModel.Address = selectedData.formatted_address;
        console.log(this.restaurantModel, this.userSettings2.inputString, this.userSettings2);
    }

    phoneValid(event: any) {
        const pattern = /[0-9\+\-\ ]/;

        let inputChar = String.fromCharCode(event.charCode);
        if (event.keyCode != 8 && !pattern.test(inputChar)) {
          event.preventDefault();
        }
      }

    onSubmit() {
        Helpers.setLoading(true);
        
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser != null)
            if (currentUser.data != null) {
                this.restaurantModel.UserId = currentUser.data._id;
                this.restaurantModel.Email = currentUser.data.EmailAddress;
        }
        console.log('this.restaurantModel added');
        console.log(this.restaurantModel);
      this.restaurantModel.RestaurantCategoryName = this.RestaurantCategories.filter(p => p._id == this.restaurantModel.RestaurantCategoryId.toString())[0].Name;
        if (this.restaurantModel._id != undefined && this.restaurantModel._id != '' && this.restaurantModel._id != null) {
            this._restaurantService.update(this.restaurantModel).subscribe(
                data => {
                    Helpers.setLoading(false);
                    this.IsSubmit = true;

                    if (this.fileToUpload != null)
                        if (this.fileToUpload.length > 0)
                            this.saveFile(this.frmData, this.restaurantModel._id)

                    this.restaurantModel = new Restaurant();
                    this.restaurantModel.RestaurantCategoryId = "0";
                    this.loadRestaurantData();

                },
                error => {
                    Helpers.setLoading(false);
                });
        }
        else {
            this._restaurantService.add(this.restaurantModel).subscribe(
                data => {
                    Helpers.setLoading(false);
                    this.restaurantModel = new Restaurant();
                    this.restaurantModel.RestaurantCategoryId = "0";

                    if (this.fileToUpload != null)
                        if (this.fileToUpload.length > 0)
                            this.saveFile(this.frmData, data.data._id)

                    this.IsSubmit = true;
                    this.loadRestaurantData();
                },
                error => {
                    Helpers.setLoading(false);
                });
        }
    }

    modalOpen(resturant_add, id) {
      this.openingHours = [{
            "day": "Sunday",
            "openingTime": "09:00",
            "closingTime": "17:00",
            "isClosed":"0"
            },
            {
            "day": "Monday",
            "openingTime": "09:00",
            "closingTime": "17:00",
            "isClosed":"0"
            },
            {
            "day": "Tuesday",
            "openingTime": "09:00",
            "closingTime": "17:00",
            "isClosed":"0"
            },
            {
            "day": "Wednesday",
            "openingTime": "09:00",
            "closingTime": "17:00",
            "isClosed":"0"
            },
            {
            "day": "Thursday",
            "openingTime": "09:00",
            "closingTime": "17:00",
            "isClosed":"0"
            },
            {
            "day": "Friday",
            "openingTime": "09:00",
            "closingTime": "17:00",
            "isClosed":"0"
            },
            {
            "day": "Saturday",
            "openingTime": "09:00",
            "closingTime": "17:00",
            "isClosed":"0"
            }
        ];
      this.selectedDietaryArray = [];
      this.restaurantModel = new Restaurant();
      this.restaurantModel.openingHours = this.openingHours;

      this.restaurantModel.RestaurantCategoryId = "0";
      this.modalReference = this.modalService.open(resturant_add);
    }

    changeTime(day, current, schedule){
        if (current === '0') {
            day.openingTime = '--:--';
            day.closingTime = '--:--';
        } else {
            day[schedule] = current;
        }
    }

    OpenNext() {
      $('#myRestaurant').hide();
      this.selectedDietaryArray = [];
      this.restaurantModel = new Restaurant();
      this.restaurantModel.RestaurantCategoryId = "0";
      $('#AddNewRest').show();
      this.ErrorModel = null;
    }


    OpenPrevious() {
        $('#AddNewRest').hide();
        $('#myRestaurant').show();
    }
    //ViewRetaurant() {
    //    $('#AddNewRest').hide();
    //    $('#myRestaurant').hide();
    //    $('#ViewRetaurant').show();
    //}

    MyRetaurant() {
        if (localStorage.getItem('SelectedRestaurant') != "undefined")
        this.SelectedRestaurant = JSON.parse(localStorage.getItem('SelectedRestaurant'));
        $('#selectedRestaurantName').text(this.SelectedRestaurant.Restaurant.Name);
        $('#myRestaurant').show();

    }

    //MyRetaurant() {
    //    var data = JSON.parse(localStorage.getItem('SelectedRestaurant'));
    //    Helpers.setLoading(true);
    //    this._restaurantService.getImages(data.Restaurant._id).subscribe(
    //        data => {
    //            this.SelectedRestaurant = JSON.parse(localStorage.getItem('SelectedRestaurant'));
    //            this.RestaurantImages = data.data;
    //            $('#myRestaurant').show();
    //            Helpers.setLoading(false);
    //        },
    //        error => {
    //            $('#myRestaurant').show();
    //            Helpers.setLoading(false);
    //        });
    //}

    public changed(e: any): void {
        if(e.value == 'add_category'){
            console.log('redirect it');
        }
        if(e.value != 'add_category' && e.value != 0){
            this.restaurantModel.RestaurantCategoryId = e.value;
        }
        //this.selected = e.value;
    }

    Detail(deatilData: any) {
        Helpers.setLoading(true);
        this._restaurantService.getImages(deatilData.Restaurant._id).subscribe(
            data => {
                this.RestaurantImages = data.data;
                this.DetailData = deatilData;
                $('#ViewRetaurant').hide();
                $('#ViewDetail').show();
                Helpers.setLoading(false);
            },
            error => {
                this.DetailData = deatilData;
                $('#ViewRetaurant').hide();
                $('#ViewDetail').show();
                Helpers.setLoading(false);
            });

    }

    BackToList() {
        $('#ViewRetaurant').show();
        $('#ViewDetail').hide();
    }

    autoClose(event) {
        var target = event.target;
        // target.style.visibility = 'hidden';
        if (!target.closest(".m-portlet__nav")) {
            $('#ViewRetaurant').hide();
            $('#myRestaurant').hide();
            $('#AddNewRest').hide();
            $('#ViewDetail').hide();
        }
    }

    edit(id: any) {
        Helpers.setLoading(true);
        this.RestaurantImages = null;
        $('#myRestaurant').hide();
        $('#ViewDetail').hide();
        var restaurant = this.Restaurants.filter(rest => rest.Restaurant._id == id)[0];
        if (restaurant != undefined) {
            this._restaurantService.getImages(id).subscribe(
                data => {
                    this.RestaurantImages = data.data;
                    this.restaurantModel = restaurant.Restaurant;
                    this.ErrorModel = null;
                    $('#ViewDetail').hide();
                    $('#AddNewRest').show();
                    Helpers.setLoading(false);
                },
                error => {
                    this.restaurantModel = restaurant.Restaurant;
                    this.ErrorModel = null;
                    $('#ViewDetail').hide();
                    $('#AddNewRest').show();
                    Helpers.setLoading(false);
                });
        }

    }

    delete(id: any) {
        if (confirm("Are you sure you want to delete ?")) {
            Helpers.setLoading(true);
            this._restaurantService.delete(id).subscribe(
                data => {
                    Helpers.setLoading(false);
                    this.IsSubmit = true;
                    this.loadRestaurantData();
                },
                error => {
                    this.IsSubmit = true;
                    Helpers.setLoading(false);
                    this.loadRestaurantData();
                });
        }
    }

    deleteImage(id: any) {
        if (confirm("Are you sure you want to delete image?")) {
            Helpers.setLoading(true);
            this._menuService.deleteImage(id).subscribe(
                data => {
                    this._restaurantService.getImages(this.restaurantModel._id).subscribe(
                        data => {
                            this.RestaurantImages = data.data;
                            Helpers.setLoading(false);
                        },
                        error => {
                            Helpers.setLoading(false);
                        });
                },
                error => {
                    Helpers.setLoading(false);
                });
        }
    }

    handleFileInput(files: FileList) {
        console.log('FILES', files);
        this.frmData = new FormData();
        this.fileToUpload = files;
        for (var i = 0; i < files.length; i++) {
            this.frmData.append("ImageFile", files[i]);
        }
    }

    saveFile(files: FormData, id: any) {
        this._restaurantService.postFile(files, id).subscribe(
            data => {
                Helpers.setLoading(false);
                this.fileToUpload = null;
            },
            error => {
                this.fileToUpload = null;
                Helpers.setLoading(false);
            });

    }

    handleFormSubmit() {
        var result = true;
        console.log('this.openingHours');
        console.log(this.openingHours);
        this.ErrorModel = {};
        if (this.restaurantModel.Name == "" || this.restaurantModel.Name == null || this.restaurantModel.Name == undefined) {
            result = false;
            this.ErrorModel.Name = "Name is Required";
        } else {
            this.ErrorModel.Name = "";
        }

        if (this.restaurantModel.RestaurantCategoryId == "0" || this.restaurantModel.RestaurantCategoryId == "" || this.restaurantModel.RestaurantCategoryId == null || this.restaurantModel.RestaurantCategoryId == undefined) {
            result = false;
            this.ErrorModel.RestaurantCategory = "Category is Required";
        } else {
            this.ErrorModel.RestaurantCategory = "";
        }

        if (this.restaurantModel.Address == "" || this.restaurantModel.Address == null || this.restaurantModel.Address == undefined) {
            result = false;
            this.ErrorModel.Address = "Address is Required";
        } else {
            this.ErrorModel.Address = "";
      }
      if (!this.restaurantModel.Lat) {
        result = false;
        this.ErrorModel.Latitude = "Latitude is Required";
      } else if (!this.isNumber(this.restaurantModel.Lat)) {
        result = false;
        this.ErrorModel.Latitude = "Invalid Latitude";
      } else {
        this.restaurantModel.Lat = this.latRange(this.restaurantModel.Lat);
        this.ErrorModel.Latitude = "";
      }
      if (!this.restaurantModel.Long) {
        result = false;
        this.ErrorModel.Longitude = "Longitude is Required";
      } else if (!this.isNumber(this.restaurantModel.Long)) {
        result = false;
        this.ErrorModel.Longitude = "Invalid Longitude";
      } else {
        this.restaurantModel.Long = this.lngRange(this.restaurantModel.Long); 
        this.ErrorModel.Longitude = "";
    }
    if (!this.restaurantModel.TotalSeats) {
      result = false;
      this.ErrorModel.TotalSeats = "Total Seats is Required";
    } else if (!this.isNumber(this.restaurantModel.TotalSeats)) {
      result = false;
      this.ErrorModel.TotalSeats = "Invalid Total Seats";
    } else {
        this.ErrorModel.TotalSeats = "";
    }
    /*if (this.restaurantModel.OpeningTime == "" || this.restaurantModel.OpeningTime == null || this.restaurantModel.OpeningTime == undefined) {
      result = false;
      this.ErrorModel.OpeningTime = "Opening Time is Required";
    } else {
      this.ErrorModel.OpeningTime = "";
    }

    if (this.restaurantModel.ClosingTime == "" || this.restaurantModel.ClosingTime == null || this.restaurantModel.ClosingTime == undefined) {
      result = false;
      this.ErrorModel.ClosingTime = "Closing Time is Required";
    } else {
      this.ErrorModel.ClosingTime = "";
    }*/

        return result;
    }

    SelectRestaurant(restaurant: any) {
        this.SelectedRestaurant = restaurant;
        localStorage.setItem('SelectedRestaurant', JSON.stringify(this.SelectedRestaurant));
        $('#ViewRetaurant').hide();
        $('#myRestaurant').show();
        var route = this._router.url;
        if (route == "/menu") {
            location.reload();
            //this.menuComponent.loadMenuData();
        }
        else if (route == "/offer") {
            location.reload();
        }
        else if (route == "/tblManagement") {
            location.reload();
        }
        else if (route == "/liveorders") {
            location.reload();
        }
        else if (route == "/index") {
            location.reload();
        }
    }

    
    isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  redirectCategory(category_id){
    console.log('category_id');
    console.log(category_id);
  }

    latRange(n) {
    var maxLat = Math.atan(Math.sinh(Math.PI)) * 180 / Math.PI;
    return Math.min(Math.max(parseInt(n), -maxLat), maxLat);
  }

    lngRange(n) {
    return Math.min(Math.max(parseInt(n), -180), 180);
  }

    ngAfterViewInit() {
      mLayout.initAside();
  }

    getDietaryType() {
      this._menuService.getAllDietaryType().subscribe(
        data => {
          this.dietaryFormArray = data.data;
        },
        error => {
          Helpers.setLoading(false);
        });
  }
  onChange(dietaryId: string, isChecked: boolean) {
    this.selectedDietaryArray = this.restaurantModel.DietaryType;
    if (isChecked) {
      this.selectedDietaryArray.push(dietaryId);
      this.restaurantModel.DietaryType = this.selectedDietaryArray;
    } else {
      let index = this.selectedDietaryArray.indexOf(dietaryId);
      this.selectedDietaryArray.splice(index, 1);
      this.restaurantModel.DietaryType = this.selectedDietaryArray;
    }
  }
}
