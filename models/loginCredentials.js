//this class is only to get all users
module.exports = class LoginCredentialObject {
    constructor(login) {
        this.personID = login.PersonID;
        this.isCustomer = login.isCustomer;
        this.loginID = login.loginID;
        this.password = login.Password ? login.Password : "";
    }
    print() {
        console.log(this.loginID, this.password, this.personID, this.isCustomer)
    }
};