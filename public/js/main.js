$('#modifyPackage').on('show.bs.modal', function (event) {
    email = $(event.relatedTarget).data("email");
    sender = $(event.relatedTarget).data("sender");
    colis_id = $(event.relatedTarget).data("id");
    $(this).find(".form-group input[type=text]").val(sender);
    $(this).find(".form-group input[type=email]").val(email);
    $(this).find("form").attr("action", "/packages/" + colis_id);
});

$('#deletePackage').on('show.bs.modal', function (event) {
    colis_id = $(event.relatedTarget).data("id");
    $(this).find("form").attr("action", "/packages/delete/" + colis_id);
});

var $tableRows    = $('table tbody tr');
var $allLinks     = $('ul.pagination li a') // $allLinks = $pagesLinks + $nextLink + $previousLink
var $pagesLinks   = $('ul.pagination li a.page-mumber')
var $nextLink     = $($allLinks[$allLinks.length-1])
var $previousLink = $($allLinks[0])
var actualPage    = 1
var rowsPerPage   = 5
var numberOfRows  = $('ul.pagination').data("number_of_rows")
var numberOfPages = Math.ceil(numberOfRows/rowsPerPage)

// Start by hiding all rows
$('table').find('tbody tr').hide();
for (var i = 0; i <= rowsPerPage - 1; i++) {
    $($tableRows[i]).show();
}

// Start by making the page 1 link look active
$($pagesLinks[0]).addClass("bg-dark");

// The previous button is disabled in the beginning
$previousLink.parent().css("cursor", "default")
$previousLink.parent().addClass("disabled")

// Event listener on the pages links
$pagesLinks.on("click", function(event) {
    actualPage = $(this).text()
    // Start by hiding all rows
    $('table').find('tbody tr').hide();

    /* Making the next/previous buttons available/disabled */
    if(actualPage == 1){
        // On the page 1, the button 'previous' is disabled
        $previousLink.parent().css("cursor", "default")
        $previousLink.parent().addClass("disabled")
    } else if (actualPage == numberOfPages){
        // On the last page, the button 'next' is disabled
        $nextLink.parent().css("cursor", "default");
        $nextLink.parent().addClass("disabled")
    }
    else{
        // Otherwise, the buttons 'next' and 'previous' are available
        $previousLink.parent().css("cursor", "pointer")
        $nextLink.parent().css("cursor", "pointer")
        $previousLink.parent().removeClass("disabled");
        $nextLink.parent().removeClass("disabled")
    }

    //Make all pages links not looking active
    for (var i=0; i<$pagesLinks.length; i++){
        $($pagesLinks[i]).removeClass("bg-dark");
    }

    //Make the actual page link look active 
    $(this).toggleClass("bg-dark");
    var beginNumber = (actualPage - 1) * rowsPerPage;
    var endNumber = actualPage * rowsPerPage - 1;

    // Show the concerned rows
    for (var i = beginNumber; i <= endNumber; i++) {
        $($tableRows[i]).show();
    }
});

$nextLink.on("click", function(){
    // Trigger the next page link
    $($pagesLinks[actualPage]).trigger("click")
})

$previousLink.on("click", function(){
    // Trigger the previous page link
    $($pagesLinks[actualPage - 2]).trigger("click")
})

var allEmails = []

$.get("/getPackages", function(data){
    // Shorten this code ??!
    data.rows.forEach(function(emailObject){
        if (emailObject.hasOwnProperty("email_address") && emailObject.email_address != null ) $("#studentsData").append("<option>"+emailObject.email_address+"</option>")
    })
    console.log(allEmails[0])
    
})

    
/* TO DOs */

// Make the previous/next button look different when disabled
// "Showing 5 results out of 11"
// Possibility to modifiy rowsPerPage
// Not display the blue effect when clicking on a link
// Search
// auto completion when entering emails