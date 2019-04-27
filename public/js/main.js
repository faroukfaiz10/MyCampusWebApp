// Set the inputs values in the modify modal to the actual values of the package to modify
$('#modifyPackage').on('show.bs.modal', function (event) {
    email = $(event.relatedTarget).data("email");
    sender = $(event.relatedTarget).data("sender");
    colis_id = $(event.relatedTarget).data("id");
    $(this).find(".form-group input[type=text]").val(sender);
    $(this).find(".form-group input[type=email]").val(email);
    // Set the post request path
    $(this).find("form").attr("action", "/packages/" + colis_id);
});

// Set the post request path
$('#deletePackage').on('show.bs.modal', function (event) {
    colis_id = $(event.relatedTarget).data("id");
    $(this).find("form").attr("action", "/packages/delete/" + colis_id);
});

var rowsPerPage   = 5  // Starting value
var numberOfRows  = $('ul.pagination').data("number_of_rows")
var numberOfPages = Math.ceil(numberOfRows/rowsPerPage)
var $tableRows    = $('table tbody tr');
var pagesHtml     = ""

// Generating Html for the pages links
function pagesLinksHtml (){
    pagesHtml = "<li class='page-item'><a class='page-link bg-secondary text-light'>Précédent</a></li>"
    for(var i=1; i <= numberOfPages; i++){
        pagesHtml += "<li class=''><a class='page-link bg-secondary text-light page-number'>"+ i +"</a></li>"
    };
    pagesHtml += "<li class='page-item'><a class='page-link bg-secondary text-light'>Suivant</a></li>"
    $("ul.pagination").html(pagesHtml);
}

pagesLinksHtml()
// Then create the variables related to pages links
var $allLinks     = $('ul.pagination li a') // $allLinks = $pagesLinks + $nextLink + $previousLink
var $pagesLinks   = $('ul.pagination li a.page-number')
var $nextLink     = $($allLinks[$allLinks.length-1])
var $previousLink = $($allLinks[0])
var actualPage    = 1

function eventsHandlingLinks(){
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
            $nextLink.parent().css("cursor", "pointer")
            $nextLink.parent().removeClass("disabled")
        } else if (actualPage == numberOfPages){
            // On the last page, the button 'next' is disabled
            $nextLink.parent().css("cursor", "default");
            $nextLink.parent().addClass("disabled")
            $previousLink.parent().css("cursor", "pointer")
            $previousLink.parent().removeClass("disabled")
        }
        else{
            // Otherwise, the buttons 'next' and 'previous' are available
            $previousLink.parent().css("cursor", "pointer")
            $nextLink.parent().css("cursor", "pointer")
            $previousLink.parent().removeClass("disabled")
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
}

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

// Set up event handling for pages links
eventsHandlingLinks()

// Event handling when changing rowsPerPage parameter
$('.custom-select').on("change", function(){
    rowsPerPage   = parseInt($(this).val(),10)
    actualPage    = 1  //Return to page 1 when changing rowsPerPage
    numberOfPages = Math.ceil(numberOfRows/rowsPerPage)

    // Display first page rows
    $('table').find('tbody tr').hide();
    for (var i = 0; i <= rowsPerPage - 1; i++) {
        $($tableRows[i]).show();
    }

    // Pages Links
    pagesLinksHtml()
    $allLinks     = $('ul.pagination li a') // $allLinks = $pagesLinks + $nextLink + $previousLink
    $pagesLinks   = $('ul.pagination li a.page-number')
    $nextLink     = $($allLinks[$allLinks.length-1])
    $previousLink = $($allLinks[0])
    $($pagesLinks[0]).addClass("bg-dark"); // Page 1 link looks active
    $previousLink.parent().css("cursor", "default") // The previous button is disabled in the beginning
    $previousLink.parent().addClass("disabled")
    eventsHandlingLinks()
})

//Autocompletion for emails
$.get("/emails", function(data){
    var allEmails=[];
    data.rows.forEach(function(emailObject){
        // Some emails are set to null
        if (emailObject.hasOwnProperty("email_address") && emailObject.email_address != null ){ 
            allEmails.push(emailObject.email_address)
        }
    })
    $(".email").typeahead({source:allEmails, items:5, fitToElement:true});
})



/* TO DOs */

// Make the previous/next button look different when disabled
// "Showing 5 results out of 11"
// Possibility to modifiy rowsPerPage
// Search
// max length input (30 chars expediteur)
// Set the default value of the select input to 10 ? Or store it somewhere to retrieve it after reloading the page.
// Problem when setting rowsperpage to 10 then reloading page : it stays at 10 without and displays only 5 + dosen't do nothing if we click on 10 again