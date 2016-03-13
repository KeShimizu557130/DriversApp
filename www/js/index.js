var ViewModel = {
	items: ko.observableArray([
		{ arrivalTime: "09:00", location: "渋谷", departureTime: "10:05" },
		{ arrivalTime: "10:21", location: "横浜", departureTime: "12:30" },
		{ arrivalTime: "13:05", location: "平塚", departureTime: "15:00" }
    ]),
    inputArrivalTime: ko.observable(""),
    inputDepartureTime: ko.observable(""),
    inputLocation: ko.observable("Sample"),
    inputLocation2: ko.observable("Sample2")
};