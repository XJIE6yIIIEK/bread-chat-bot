function check(request)
{
    if (request.getResponseHeader("Location"))
    {
        window.location.href = "auth-page.html";
        return true;
    }
    return false
}

function auth(login, password)
{$.ajax
    ({
        url: "http://46.146.165.142:60547/api/v1/auth",
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
    document.getElementById("error_label").innerHTML = "Неверный логие или пароль.";
}
function goToMain()
{
    document.location.href = "index.html";
}

$("body").on("click", ".enter_button", function(){
    let login = document.getElementById("login").value;
    let password = document.getElementById("password").value;
    try {
        auth(login, password);
    }
    catch (e){console.log(e)}
});

