
/* Initial Process */
$(document).ready(function() {
    /* Bind to ViewModel */
    ko.applyBindings(ViewModel);
});

/** TemporaryInputData Format Class
 */
var Location = (function() {
    /** Constructor
     */
    var Location = function(arrival, locationName, departure, moving) {
        this.arrivalTime   = ko.observable(arrival);      // moment
        this.locationName  = ko.observable(locationName); // string
        this.departureTime = ko.observable(departure);    // moment
        if (typeof moving == 'string') {                  // string
            this.movingTime = ko.observable(moving);      // 前の地点からの移動時間 (string) が指定された場合
        } else if (typeof moving == 'object') {           // 前の地点の departureTime (moment) が指定された場合
            var min_diff = p.__getDifferenceMinutes(arrival, moving);
            this.movingTime = ko.observable(min_diff);
        }
    };

    var p = Location.prototype;

    /** Copy Constructor
     */
    p.clone = function() {
        return new Location(this.arrivalTime(), this.locationName(), this.departureTime(), this.movingTime());
    }

    /** [Private]
     */
    p.__getDifferenceMinutes = function(a, b) {
        var min_diff = moment(a.diff(b));
        return min_diff.utc().format('H:mm');
    }

    return Location;
})();

// メイン画面 記録表の入力状態
var EntriedColumnStatus = {
    ArrivalTime: 0,     // 到着時刻が入力済
    LocationName: 1,        // 経由地まで入力済
    DepartureTime: 2    // 出発時刻まで入力済
};

// カスタムバインディング登録
ko.bindingHandlers.date = {
    update: function(element, valueAccessor, allBindings) {
        return ko.bindingHandlers.text.update(element, function() {
            var value = ko.utils.unwrapObservable(valueAccessor());
            if (value == null) {
                return null;
            }
            if (typeof value === "string") {
                return value;
            }
            return value.format('HH:mm');

        }, allBindings, null, null);
    }
};

/** Define ViewModel
 */
var ViewModel = {
    /** Route Information Data.
     */
    LocationList: ko.observableArray([
        new Location(moment("09:00", "HH:mm"), "渋谷", moment("10:05", "HH:mm"), ""),
        new Location(moment("10:21", "HH:mm"), "横浜", moment("12:30", "HH:mm"), "0:16"),
        new Location(moment("13:05", "HH:mm"), "平塚", moment("14:30", "HH:mm"), "0:35")
    ]),

    /** Tempolary Input Data.
     */
    LocationOnDialog: new Location("", "", "", ""),

    /** Editing row number
     */
    current_id: 0,

    // 経由地情報変更（経由地編集ダイアログで登録ボタンクリック）
    updateRow: function() {
        var previous_rowdata   = ViewModel.LocationList()[ViewModel.current_id - 1];
        var previous_departure = previous_rowdata.departureTime();
        var arrival            = moment(ViewModel.LocationOnDialog.arrivalTime(), "HH:mm");
        var departure          = moment(ViewModel.LocationOnDialog.departureTime(), "HH:mm");
        ViewModel.LocationList.splice(ViewModel.current_id, 1, new Location(arrival,
                                                                    ViewModel.LocationOnDialog.locationName(),
                                                                    departure,
                                                                    previous_departure));
        $.mobile.changePage('#main_screen');
    },
    // 経由地名称変更（経由地名称更新ダイアログで登録ボタンクリック）
    updateLocationName: function() {
        var rowdata = ViewModel.LocationList()[ViewModel.current_id];
        var newinput = rowdata.clone();
        newinput.locationName(ViewModel.LocationOnDialog.locationName());
        ViewModel.LocationList.splice(ViewModel.current_id, 1, newinput);
        $.mobile.changePage('#main_screen');
    },
    // 到着時刻、経由地名称、出発時刻記録（メイン画面 記録ボタンクリック）
    record: function() {
        var status = ViewModel.__getEntriedStatus();
        switch (status) {
            case EntriedColumnStatus.ArrivalTime:
                ViewModel.LocationOnDialog.locationName("");
                $("#recordLocationNameDialog").popup("open");
                break;
            case EntriedColumnStatus.LocationName:
                //出発時刻入力
                var rowdata = ViewModel.LocationList()[ViewModel.current_id];
                var newinput = rowdata.clone();
                newinput.departureTime(moment());
                ViewModel.LocationList.splice(ViewModel.current_id, 1, newinput);
                break;
            case EntriedColumnStatus.DepartureTime:
                //到着時刻入力
                var previous_rowdata   = ViewModel.LocationList()[ViewModel.current_id];
                var previous_departure = moment(previous_rowdata.departureTime());
                var arrival            = moment();
                ViewModel.LocationList.push(new Location(arrival, "", "", previous_departure));
                break;
        }
    },
    // 経由地情報変更ダイアログ表示（メイン画面 記録表の行クリック）
    editRow: function(rowdata, event) {
        ViewModel.current_id = event.target.id;
        ViewModel.LocationOnDialog.arrivalTime(rowdata.arrivalTime().format("HH:mm"));
        ViewModel.LocationOnDialog.locationName(rowdata.locationName());
        if (rowdata.departureTime != "") {
            ViewModel.LocationOnDialog.departureTime(rowdata.departureTime().format("HH:mm"));
        }
        $('#updateLocationDialog').popup('open');
    },
    /** [Private]
     */
    __getEntriedStatus: function() {
        var count = ViewModel.LocationList().length;
        var row   = count - 1;
        while (row >= 0) {
            ViewModel.current_id  = row;
            var rowdata = ViewModel.LocationList()[row];
            if (rowdata.departureTime() != "") {
                // 出発時刻まで入力済
                return EntriedColumnStatus.DepartureTime;
            }
            if (rowdata.locationName() != "") {
                // 経由地まで入力済
                return EntriedColumnStatus.LocationName;
            }
            if (rowdata.arrivalTime() != "") {
                // 到着時刻が入力済
                return EntriedColumnStatus.ArrivalTime;
            }
            row--;
        }
        return -1;
    },
};

