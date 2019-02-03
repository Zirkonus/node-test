var DefaultStartAddress = '1452 56th Street, Brooklyn, NY 11219';
var DefaultDestinationAddress = '';
var StartAddress = {};
var DestinationAddress = {};
var ErrorMessages = [];
var ErrorStatus = 0;
var DataStatus = 0;
var config = {
    interval: 100,
    timeout: 60000
}

var showResult = function(data='') {
    if (ErrorMessages.length) {
        ShowMessage = '';
        ErrorMessages.forEach(function(message) {
            ShowMessage += message + '<br/>';
        });
        $("#result").html('<div class="error">' + ShowMessage + '</div>');
    } else {
        $("#result").html(data);
    }
}

var showInProgress = function() {
    $("#result").html('<div class="inprogress">Loading... Please wait.</div>');
}

var checkAddress = function(AddressField) {
    var Address = $("#" + AddressField).val();
    $.ajax({
        url: "/checkAddress",
        type: "POST",
        data: {
            Address: Address
        },
        success: function (result) {
            if (result.error == 1) {
                ErrorStatus = 1;
                ErrorMessages.push('We cannot recognize your ' + AddressField + '! Please clarify it.');
            } else {
                $("#" + AddressField).val(result.address)
                window[AddressField] = {lat: result.lat, lon: result.lon, address: result.address, value: Address};
            }
        },
        error: function () {
            if (ErrorStatus != 2) ErrorMessages.push('Checking address service is busy at the moment! Please try again later.');
            ErrorStatus = 2;
        }
    });
};

$(document).ready(function() {

    $("#ClearData").click(function() {
        $("#StartAddress").val(DefaultStartAddress);
        $("#DestinationAddress").val(DefaultDestinationAddress);
        $("#result").html("");
    });

    $("#SendData").click(function() {

        ErrorMessages = [];
        ErrorStatus = 0;

        if (!$("#StartAddress").val() || !$("#DestinationAddress").val()) {
            alert("Please fill all fields!");
        } else {
            showInProgress();

            checkAddress('StartAddress');
            checkAddress('DestinationAddress');

            var CheckData = setInterval(function() {
                if (ErrorStatus) {
                    clearInterval(CheckData);
                    showResult();
                }
                if (StartAddress.lat && DestinationAddress.lat) {
                    clearInterval(CheckData);
                    $.ajax({
                        url: "/getEstimatetion",
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({
                            StartAddress: StartAddress,
                            DestinationAddress: DestinationAddress
                        }),
                        success: function (data) {
                            showResult(data);
                        },
                        statusCode: {
                            400: function() {
                                ErrorMessages.push('Distance between start and end location exceeds 100 miles');
                                showResult();
                            },
                            500: function() {
                                ErrorMessages.push('Estimation service is busy at the moment! Please try again later.');
                                showResult();
                            }
                        }
                    });
                }
            }, config.interval);

            setTimeout(function() {
                clearInterval(CheckData);
                if (!(StartAddress.lat && DestinationAddress.lat)) {
                    ErrorMessages.push('It looks like the service temporarily unavailable! Please try again later.');
                    showResult();
                }
            }, config.timeout);
        }



        /*var StartAddress = $("#StartAddress").val();
        var DestinationAddress = $("#DestinationAddress").val();

        if (!StartAddress || !DestinationAddress) {
            alert("Please fill all fields!");
        } else {
            $("#result").html("Loading... Please wait.");

            $.ajax({
                url: "/checkAddress",
                type:"POST",
                data: {
                    Address: StartAddress
                },
                success: function (result) {
                    if (result.error == 1) {
                        $("#result").html('<div class="error">We cannot recognize your start address! Please clarify it!</div>');
                    } else {
                        $("#StartAddress").val(result.address)
                        var StartAddressGeo = {lat: result.lat, lon: result.lon};
                    }
                },
                error: function () {
                    $("#result").html('<div class="error">Something wrong! Please try again later!</div>');
                }
            });
*/
            /*$.ajax({
                url: "/send",
                type:"POST",
                data: {
                    StartAddress: StartAddress,
                    DestinationAddress: DestinationAddress
                },
                success: function (result) {
                    $("#result").html(result);
                },
                error: function () {
                    $("#result").html('<div class="error">Something wrong! Please try again later!</div>');
                }
            });*/
        //}
    });

});