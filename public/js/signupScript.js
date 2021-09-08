const subSelect = document.querySelector('#subscriptionTypeSelect');
subSelect.addEventListener('change', (event) => {
    const cost = document.querySelector('#cost');
    const allowedCars = document.querySelector('#allowedCars');
    switch (event.target.value) {
        case '1': cost.innerText = '300'; allowedCars.innerText = '1'; break;
        case '2': cost.innerHTML = '750'; allowedCars.innerText = '3'; break;
        case '3': cost.innerText = '2000'; allowedCars.innerText = '9'; break;
        case '4': cost.innerText = '0'; allowedCars.innerText = '1'; break;
        default: cost.innerText = 0; allowedCars.innerText = 0;
    }
});
