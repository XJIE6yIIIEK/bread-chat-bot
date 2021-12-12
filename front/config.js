const ip = "46.146.165.142";
const port = "60547";

function address()
{
    return "https://"+ip+":"+port+"/"
}

class endpoints
{
    static auth = "api/v1/auth";
    static vacancies = "api/v1/vacancies";
    static forms = "api/v1/forms";
    static formsToVacs = "api/v1/formToVacs";
    static candidates = "api/v1/candidates";
    static botSettings = "api/v1/botSettings";
    static authCheck = "api/v1/auth/check";
}
