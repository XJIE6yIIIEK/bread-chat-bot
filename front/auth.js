function authCheck(request)
{
    if (request.getResponseHeader("Location"))
    {
        alert("SUCC");
        window.location.href = request.getResponseHeader("Location")
        return true;
    }
    return false
}

function auth(login, password)
{$.ajax
    ({
        url: address()+endpoints.auth,
        data: {"e_mail":login, "s_password":password},
        dataType: "json",
        success: function (data, textStatus, request) {alert("WTF SUCC");},
        error: function(data) {
            let status = data.status;
            if (status == 200)
            {
                goToMain();
            }
            else
            {
                errorMessage();
            }
        },
        type: "GET",
        xhrFields: {
            withCredentials: true
        }
    })
}
function errorMessage()
{
    document.getElementById("error_label").innerHTML = "Неверный логин или пароль";
}
function goToMain()
{
    window.location.href = "index.html";
}

$("body").on("click", ".enter_button", function(){
    let login = document.getElementById("login").value;
    let password = document.getElementById("password").value;
    try {
        auth(login, password);
    }
    catch (e){console.log(e)}
});

