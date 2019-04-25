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

console.log($('ul.pagination').data("number_of_rows"))