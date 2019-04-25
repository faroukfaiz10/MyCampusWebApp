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


var $tableRows = $('table tbody tr');
var $allLinks = $('ul.pagination li a')
var $pagesLinks = $('ul.pagination li a.page-mumber')
var $nextLink = $($allLinks[$allLinks.length-1])
var $previousLink = $($allLinks[0])
var actualPage = 1
var rowsPerPage = 5
var numberOfRows = $('ul.pagination').data("number_of_rows")
var numberOfPages = Math.ceil(numberOfRows/rowsPerPage)

$('table').find('tbody tr').hide();
for (var i = 0; i <= rowsPerPage - 1; i++) {
    $($tableRows[i]).show();
}
$($pagesLinks[0]).addClass("bg-dark");
$previousLink.parent().addClass("disabled")

// ADD COMMENTS 
$pagesLinks.on("click", function(event) {
    actualPage = $(this).text()
    if(actualPage == 1){
        $previousLink.parent().addClass("disabled")
    } else if (actualPage == numberOfPages){
        $nextLink.parent().addClass("disabled")
    }
    else{
        $previousLink.parent().removeClass("disabled");
        $nextLink.parent().removeClass("disabled")
    }
    for (var i=0; i<$pagesLinks.length; i++){
        $($pagesLinks[i]).removeClass("bg-dark");
    }
    $(this).toggleClass("bg-dark");
    $('table').find('tbody tr').hide();
    var beginNumber = (actualPage - 1) * rowsPerPage;
    var endNumber = actualPage * rowsPerPage - 1;
    for (var i = beginNumber; i <= endNumber; i++) {
        $($tableRows[i]).show();
    }
});

$nextLink.on("click", function(){
    $($pagesLinks[actualPage]).trigger("click")
})

$previousLink.on("click", function(){
    $($pagesLinks[actualPage - 2]).trigger("click")
})