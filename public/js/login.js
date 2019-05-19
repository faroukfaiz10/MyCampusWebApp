if ($("#message").text().length>0){
    var message = $("#message").text()
    $("#message").html("<i class='fas fa-exclamation-triangle'></i> " + message)
}