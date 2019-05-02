var $radioButtons = $("input[type=radio][name=location]")

// Function for getting today's date string
function getToday(){
    var today = new Date();
    var day = String(today.getDate()).padStart(2, '0'); // day "5" --> day "05"
    var month = String(today.getMonth() + 1).padStart(2, '0');  //January is 0
    var year = today.getFullYear();
    return day + '/' + month + '/' + year
}

// For setting today's date as default value in the date input in the create package form
$('#newPackage').on('show.bs.modal', function () {
    $(this).find("input[type=text][name=date]").val(getToday());
})

// Set the inputs values in the modify modal to the actual values of the package to modify
$('#modifyPackage').on('show.bs.modal', function (event) {
    email    = $(event.relatedTarget).data("email");
    sender   = $(event.relatedTarget).data("sender");
    date     = $(event.relatedTarget).data("date");
    comment  = $(event.relatedTarget).data("comment");
    colis_id = $(event.relatedTarget).data("id");
    // Ckeck the correct radiobutton
    loc = $(event.relatedTarget).data("location");
    if (loc == "Foyer"){
        $($radioButtons[3]).prop("checked", true);
        $("#modify_autre_input").attr("disabled",true);
        $("#modify_autre_input").val("");
    } else if (loc == "Boîte aux lettres"){
        $($radioButtons[4]).prop("checked", true);
        $("#modify_autre_input").attr("disabled",true);
        $("#modify_autre_input").val("");
    } else {
        $($radioButtons[5]).prop("checked", true);
        $("#modify_autre_input").attr("disabled",false);
        $("#modify_autre_input").val(loc);
    }
    $(this).find("input[type=text][name=sender]").val(sender);
    $(this).find("input[type=email]").val(email);
    $(this).find("input[type=text][name=date]").val(date);
    $(this).find("textarea").val(comment);
    $("#modify_date").inputmask();
    // Set the post request path
    $(this).find("form").attr("action", "/packages/" + colis_id);
});



// Set the post request path
$('#deletePackage').on('show.bs.modal', function (event) {
    colis_id = $(event.relatedTarget).data("id");
    $(this).find("form").attr("action", "/packages/delete/" + colis_id);
});

// Pour contrôler les boutons Compact et Large
$("input[name=size]").on("change",function(){
    if ($($("input[name=size]")[1]).is(":checked")){
        $("table").removeClass("table-sm");
    } else{
        $("table").addClass("table-sm");
    }
})


var rowsPerPage   = 10  // Starting value
var numberOfRows  = $('ul.pagination').data("number_of_rows")
var numberOfPages = Math.ceil(numberOfRows/rowsPerPage)
var $tableRows    = $('table tbody tr');
var pagesHtml     = ""

// For controling the 'other' input on the add and modify modals
$radioButtons.on("change",function(){
    // Create modal
	if ($($radioButtons[2]).is(":checked")){
		$("#add_autre_input").attr("disabled",false);
    } else{
        $("#add_autre_input").attr("disabled",true);
        $("#add_autre_input").val("");
    }
    // Modify modal
    if ($($radioButtons[5]).is(":checked")){
		$("#modify_autre_input").attr("disabled",false);
    } else{
        $("#modify_autre_input").attr("disabled",true);
        $("#modify_autre_input").val("");
    }
})

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
        var endNumber   = Math.min(actualPage * rowsPerPage - 1, $tableRows.length - 1);
        rowsDisplayed = endNumber - beginNumber + 1;
        $("#rows_displayed").text(rowsDisplayed);

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

// Start by hiding all rows then showing the first rowsPerPage ones
$('table').find('tbody tr').hide();
for (var i = 0; i <= rowsPerPage - 1; i++) {
    $($tableRows[i]).show();
}

var rowsDisplayed = Math.min($tableRows.length,rowsPerPage)
$("#rows_displayed").text(rowsDisplayed);

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
    rowsDisplayed = Math.min($tableRows.length,rowsPerPage)
    $("#rows_displayed").text(rowsDisplayed);
    eventsHandlingLinks()
})

//Get request to Back end to retrieve emails array
$.get("/emails", function(data){
    var allEmails = data
    // Autocompletion using emails array
    // The typeahead function is inside the callback because it has to wait for the array to be defined
    $(".email").typeahead({source:allEmails, items:5, fitToElement:true});
    // Submit event to check if email is valid
    // The submit event handler is inside the callback because we want the allEmails variable to be local
    $("#add_package").submit(function(event){
        if (!(allEmails.includes($($("input[type=email]")[0]).val()))){
            event.preventDefault() // Ne pas envoyer la requête
            $($("input[type=email]")[0]).addClass("is-invalid") // Montrer que le problème vient du champ email
        }
    })
})

// Input mask for the date input in the "add package" modal
$("#add_date").inputmask();



/* TO DOs */

// Make the previous/next button look different when disabled
// Search
// calculate numberOfRows by front js
// compact-large
// Tooltips for large collumns