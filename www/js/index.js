
/* Initial Process */
$(document).ready(function() {
    /* Bind to ViewModel */
    ko.applyBindings(ViewModel);
});

/** TemporaryInputData Format Class
 */
var InputDataEntity = (function() {
    /** Constructor
     */
    var InputDataEntity = function(arrival, location, departure, moving) {
        this.arrivalTime   = ko.observable(arrival);
        this.location      = ko.observable(location);
        this.departureTime = ko.observable(departure);
        this.movingTime    = ko.observable(moving);
    };

    var p = InputDataEntity.prototype;

    /** Copy Constructor
     */
    p.clone = function() {
        return new InputDataEntity(this.arrivalTime(), this.location(), this.departureTime(), this.movingTime());
    }

    return InputDataEntity;
})();

// メイン画面 記録表の入力状態
var EntriedColumnStatus = {
    ArrivalTime: 0,     // 到着時刻が入力済
    Location: 1,        // 経由地まで入力済
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
    items: ko.observableArray([
        new InputDataEntity(moment("09:00", "HH:mm"), "渋谷", moment("10:05", "HH:mm"), ""),
        new InputDataEntity(moment("10:21", "HH:mm"), "横浜", moment("12:30", "HH:mm"), "0:16"),
        new InputDataEntity(moment("13:05", "HH:mm"), "平塚", moment("14:30", "HH:mm"), "0:35")
    ]),

    /** Tempolary Input Data.
     */
    inputData: new InputDataEntity("", "", "", ""),

    /** Editing row number
     */
    current_id: 0,

    // 経由地情報変更（経由地編集ダイアログで登録ボタンクリック）
    updateRow: function() {
        var previous_rowdata   = ViewModel.items()[ViewModel.current_id - 1];
        var previous_departure = previous_rowdata.departureTime();
        var arrival            = moment(ViewModel.inputData.arrivalTime(), "HH:mm");
        var departure          = moment(ViewModel.inputData.departureTime(), "HH:mm");
        ViewModel.items.splice(ViewModel.current_id, 1, new InputDataEntity(arrival,
                                                                    ViewModel.inputData.location(),
                                                                    departure,
                                                                    ViewModel.__getDifferenceMinutes(arrival, previous_departure)));
        $.mobile.changePage('#main_screen');
    },
    // 経由地名称変更（経由地名称更新ダイアログで登録ボタンクリック）
    updateLocation: function() {
        var rowdata = ViewModel.items()[ViewModel.current_id];
        var newinput = rowdata.clone();
        newinput.location(ViewModel.inputData.location());
        ViewModel.items.splice(ViewModel.current_id, 1, newinput);
        $.mobile.changePage('#main_screen');
    },
    // 到着時刻、経由地名称、出発時刻記録（メイン画面 記録ボタンクリック）
    record: function() {
        var status = ViewModel.__getEntriedStatus();
        switch (status) {
            case EntriedColumnStatus.ArrivalTime:
                $("#recordLocationDialog").popup("open");
                break;
            case EntriedColumnStatus.Location:
                //出発時刻入力
                var rowdata = ViewModel.items()[ViewModel.current_id];
                var newinput = rowdata.clone();
                newinput.departureTime(moment());
                ViewModel.items.splice(ViewModel.current_id, 1, newinput);
                break;
            case EntriedColumnStatus.DepartureTime:
                //到着時刻入力
                var previous_rowdata   = ViewModel.items()[ViewModel.current_id];
                var previous_departure = moment(previous_rowdata.departureTime());
                var arrival            = moment();
                ViewModel.items.push(new InputDataEntity(arrival, "", "", ViewModel.__getDifferenceMinutes(arrival, previous_departure)));
                break;
        }
    },
    // 経由地情報変更ダイアログ表示（メイン画面 記録表の行クリック）
    editRow: function(rowdata, event) {
        ViewModel.current_id = event.target.id;
        ViewModel.inputData.arrivalTime(rowdata.arrivalTime().format("HH:mm"));
        ViewModel.inputData.location(rowdata.location());
        if (rowdata.departureTime != "") {
            ViewModel.inputData.departureTime(rowdata.departureTime().format("HH:mm"));
        }
//        ViewModel.inputData = rowdata.clone();
        $('#popupRegist').popup('open');
    },
    /** [Private]
     */
    __getDifferenceMinutes: function(arrivalTime, previousDepartureTime) {
        var min = moment(arrivalTime.diff(previousDepartureTime));
        return min.utc().format('H:mm');
    },
    /** [Private]
     */
    __getEntriedStatus: function() {
        var count = ViewModel.items().length;
        var row   = count - 1;
        while (row >= 0) {
            ViewModel.current_id  = row;
            var rowdata = ViewModel.items()[row];
            if (rowdata.departureTime() != "") {
                // 出発時刻まで入力済
                return EntriedColumnStatus.DepartureTime;
            }
            if (rowdata.location() != "") {
                // 経由地まで入力済
                return EntriedColumnStatus.Location;
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

