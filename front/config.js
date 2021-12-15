const ip = "46.146.165.142";
const port = "60547";
const calendar_ip = "";
const calendar_port = "";

function address()
{
    return "https://"+ip+":"+port+"/"
}

class endpoints
{
    static auth = "api/v1/auth";
    static authCheck = "api/v1/auth/check";
    static botSettings = "api/v1/botSettings";
    static vacancies = "api/v1/vacancies";
    static forms = "api/v1/forms";
    static formsToVacs = "api/v1/formToVacs";
    static candidates = "api/v1/candidates";
    static user = "api/v1/users/user"; // GET
    static info = "api/v1/commands";
    static general = "api/v1/forms/:id/general" // POST / DELETE
    static favorite = "api/v1/users/favorites"; // POST / DELETE
}
