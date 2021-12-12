$.ajax({
    url: address() + endpoints.authCheck,
    error: function (request, textStatus, errorThrown)
    {
        authCheck(request);
    },
    xhrFields: {
        withCredentials: true
    }
})
