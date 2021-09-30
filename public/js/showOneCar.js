let i;
let p;
let cars;
let currentCarIndex = 0;
let maxCarIndex;

const showCar = (index) => {
    console.log(index)
    try {
        p.innerText = cars[index].Color;
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
    const nextBtn = document.querySelector('.nextBtn');
    const prevBtn = document.querySelector('.prevBtn');
    prevBtn.addEventListener('click', showPrevCar);
    nextBtn.addEventListener('click', showNextCar);

    const rent = document.createElement('button');
    rent.innerText="Rent";

    rent.addEventListener('click',async ()=>{
        const rentString = `/cars/rent/${cars[currentCarIndex].CarID}`;
        try{
        const mes=await axios.get(rentString);
        console.log(mes)}catch(e){console.log(e)}
        rent.classList.add('done');
        location.reload();
    })
    document.querySelector('.carContainer').appendChild(rent);
    

    showCar(0);
}
initialize()
// getCars();