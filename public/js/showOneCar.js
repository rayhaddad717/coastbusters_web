let i;
let p;
let cars;
let currentCarIndex = 0;
let maxCarIndex;

const showCar = (index) => {
    console.log(index)
    try {
        p.innerText = cars[index].Color + cars[index].Condition + cars[index].NeedsRepair;
        i.src = cars[index].image;
    } catch (e) { console.log(e) }

}
const showNextCar = () => {
    if(currentCarIndex === maxCarIndex ){
        currentCarIndex=0;
        showCar(0);
    } else{
    showCar(++currentCarIndex);}
}
const showPrevCar = () => {
    if(currentCarIndex === 0 ){
        currentCarIndex = maxCarIndex;
        showCar(maxCarIndex);
    }else{
    showCar(--currentCarIndex);}
}


const getCars = async () => {
    const carModelIDTD = document.querySelector('.carModelID');
    const id = carModelIDTD.innerText;
    try {
        const api = `/cars/getAvailableCars/${id}`;
        const result= await axios.get(api);
        const cars = result.data.cars;
        console.log(cars)
        return cars;
    } catch (e) {
        console.log(e)
    }
};

const initialize = async () => {

    cars = await getCars();
    maxCarIndex=cars.length - 1;
    
    p = document.createElement('p');
    p.classList.add('info');
    i = document.createElement('img');
    i.classList.add('carImg');
    document.querySelector('.carContainer').appendChild(p);
    document.querySelector('.carContainer').appendChild(i);

    const rentBtn = document.createElement('button');
    rentBtn.innerText="Rent";

    rentBtn.addEventListener('click',async ()=>{
        const rentString = `/cars/rent/${cars[currentCarIndex].CarID}`;
        try{
        const mes=await axios.get(rentString);
        console.log(mes)}catch(e){console.log(e)}
        rentBtn.classList.add('done');
        location.reload();
    })
const buttonContainer = document.createElement('div');
buttonContainer.classList.add('button-container');

const nextBtn = document.createElement('button')
nextBtn.classList.add('nextBtn');
nextBtn.innerText = 'Next';
const prevBtn = document.createElement('button')
prevBtn.classList.add('prevBtn');
prevBtn.innerText = 'Prev';
prevBtn.addEventListener('click', showPrevCar);
nextBtn.addEventListener('click', showNextCar);

buttonContainer.appendChild(prevBtn);
buttonContainer.appendChild(nextBtn);
document.querySelector('.carContainer').appendChild(rentBtn);

document.querySelector('.carContainer').appendChild(buttonContainer);
console.log('initialized')
    showCar(0);
}
initialize()
// getCars();