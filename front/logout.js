$("body").on("click", ".logout", function() {
    $.ajax({
        url: address()+endpoints.logout,
        type: "GET",
        xhrFields:{
            withCredentials: true
        },
        success: function ()
        {
            window.location = "auth-page.html";
        }
    });
});