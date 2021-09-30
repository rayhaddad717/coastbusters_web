module.exports = class PersonObject {
        constructor(person) {
            this.personID = person.PersonID;
            this.firstName = person.FirstName;
            this.lastName = person.LastName;
            this.dateOfBirth = person.DateOfBirth;
            this.address = person.Address;
            this.isCustomer = person.isCustomer;
            this.subscriptionID = person.SubscriptionID;
            this.accidentsMade = person.AccidentsMade;
            this.nbOfRentedCars = person.NbOfRentedCars;
        };
        print() {
            const { personID, firstName, lastName, dateOfBirth, address, isCustomer, subscriptionID, accidentsMade, nbOfRentedCars } = this;
    
            console.log(personID, firstName, lastName, dateOfBirth, address, isCustomer, subscriptionID, accidentsMade, nbOfRentedCars);
        }
};