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



var rowsPerPage = 5
var numberOfRows  = $('ul.pagination').data("number_of_rows")
var numberOfPages = Math.ceil(numberOfRows/rowsPerPage)




var pagesHtml = "<li class='page-item'><a class='page-link bg-secondary text-light'>Précédent</a></li>"

numberOfPages = Math.ceil(numberOfRows/rowsPerPage)
for(var i=1; i <= numberOfPages; i++){
    pagesHtml += "<li class=''><a class='page-link bg-secondary text-light page-number'>"+ i +"</a></li>"
};
pagesHtml += "<li class='page-item'><a class='page-link bg-secondary text-light'>Suivant</a></li>"
$("ul.pagination").html(pagesHtml);

var $tableRows    = $('table tbody tr');
var $allLinks     = $('ul.pagination li a') // $allLinks = $pagesLinks + $nextLink + $previousLink
var $pagesLinks   = $('ul.pagination li a.page-number')
var $nextLink     = $($allLinks[$allLinks.length-1])
var $previousLink = $($allLinks[0])
var actualPage    = 1


function eventlistenerlinks(){
    // Event listener on the pages links
    $pagesLinks.on("click", function(event) {
        console.log("hi")
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
        console.log("next")
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

eventlistenerlinks()

$('.custom-select').on("change", function(){
    console.log("change")
    actualPage    = 1
    pagesHtml = "<li class='page-item'><a class='page-link bg-secondary text-light'>Précédent</a></li>"
    rowsPerPage = parseInt($(this).val(),10)
    $('table').find('tbody tr').hide();
    for (var i = 0; i <= rowsPerPage - 1; i++) {
        $($tableRows[i]).show();
    }
    numberOfPages = Math.ceil(numberOfRows/rowsPerPage)
    for(var i=1; i <= numberOfPages; i++){
        pagesHtml += "<li class=''><a class='page-link bg-secondary text-light page-number'>"+ i +"</a></li>"
    };
    pagesHtml += "<li class='page-item'><a class='page-link bg-secondary text-light'>Suivant</a></li>"
    $("ul.pagination").html(pagesHtml);
    $allLinks     = $('ul.pagination li a') // $allLinks = $pagesLinks + $nextLink + $previousLink
    $pagesLinks   = $('ul.pagination li a.page-number')
    $nextLink     = $($allLinks[$allLinks.length-1])
    $previousLink = $($allLinks[0])
    // Start by making the page 1 link look active
    $($pagesLinks[0]).addClass("bg-dark");

    // The previous button is disabled in the beginning
    $previousLink.parent().css("cursor", "default")
    $previousLink.parent().addClass("disabled")
    eventlistenerlinks()
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