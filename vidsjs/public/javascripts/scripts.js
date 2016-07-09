function initModalForRename(id, value) {
    $("#popupTitle").text("Name Change");
    $("#popupBody").html('<form>'
        + '<fieldset class="form-group">'
        + '<label for="newname">New name</label>'
        + '<input type="text" class="form-control" id="newname" value="'+value+'">'
        + '</fieldset>');
    
    $("#popupSave").on('click', function() {
        $.ajax({
            url: "/changeItemName/" + id + "/" + $("#newname").val()
        }).done(function(data) {
            $("#"+id+"_name").text($("#newname").val());
            $("#popupSave").off('click');
        });
        
    });
}

function initModalForNewFolder() {
    $("#popupTitle").text("New Folder");
    var body = '<form>'
        + '<fieldset class="form-group">'
        + '<label for="foldername">Folder Name</label>'
        + '<input type="text" class="form-control" id="foldername">'
        + '</fieldset>'
        + '<fieldset class="form-group">'
        + '<label for="parentfolder">Parent Folder</label>'
        + '<select class="form-control" id="parentfolder">'
        + '<option value="0" selected>--No Parent--</option>';
    $("button").each(function(index){
        
        if($(this).data('target') !== undefined && Number($(this).data('target').substr(1))) {
            var id = Number($(this).data('target').substr(1));
            body += '<option value="' + id +'">'+ $("#"+id+"_name").text() +'</option>';
        }
        
    });
    body += '</select>'
    body += '</fieldset>'
    $("#popupBody").html(body);
    
    $("#popupSave").on('click', function() {
        $.ajax({
            url: "/createFolder/" + $("#parentfolder").val() + "/" + $("#foldername").val()
        }).done(function(data) {
            $.ajax({
                url: "/api/virtlist"
            }).done(function(html) {
                $("#maincontainer").html(html);
                $("#popupSave").off('click');
            });
        });
        
    });
}

function initModalForMove(id) {
    $("#popupTitle").text("Move Item");
    var body = '<form>'
        + '<fieldset class="form-group">'
        + '<label for="parentfolder">new Parent Folder</label>'
        + '<select class="form-control" id="parentfolder">'
        + '<option value="0" selected>--No Parent--</option>';
    $("button").each(function(index){
        
        if($(this).data('target') !== undefined && Number($(this).data('target').substr(1))) {
            var parent = Number($(this).data('target').substr(1));
            body += '<option value="' + parent +'">'+ $("#"+parent+"_name").text() +'</option>';
        }
        
    });
    body += '</select>'
    body += '</fieldset>'
    $("#popupBody").html(body);
    
    $("#popupSave").on('click', function() {
        $.ajax({
            url: "/moveItem/" + id + "/" + $("#parentfolder").val()
        }).done(function(data) {
            $.ajax({
                url: "/api/virtlist"
            }).done(function(html) {
                $("#maincontainer").html(html);
                $("#popupSave").off('click');
            });
        });
        
    });
}