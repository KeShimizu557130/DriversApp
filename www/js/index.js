var ViewModel = {
	items: ko.observableArray([
		{ startTime: "09:00", location: "渋谷", arrivalTime: "10:05" },
		{ startTime: "10:21", location: "横浜", arrivalTime: "12:30" },
		{ startTime: "13:05", location: "平塚", arrivalTime: "15:00" }
    ]),
    inputStartTime: ko.observable(""),
    inputLocation: ko.observable("Sample"),
    inputArrivalTime: ko.observable("")
};