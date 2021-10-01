let color,condition,needsRepair,image;
let cars;
let currentCarIndex = 0;
let maxCarIndex;

const showCar = (index) => {
    console.log(index)
    try {
        color.innerText = cars[index].Color;
        condition.innerText=cars[index].Condition;
        needsRepair.innerText= cars[index].NeedsRepair;
        image.src = cars[index].image;
    } catch (e) { console.log(e) }

}
const showNextCar = () => {
    if (currentCarIndex === maxCarIndex) {
        currentCarIndex = 0;
        showCar(0);
    } else {
        showCar(++currentCarIndex);
    }
}
const showPrevCar = () => {
    if (currentCarIndex === 0) {
        currentCarIndex = maxCarIndex;
        showCar(maxCarIndex);
    } else {
        showCar(--currentCarIndex);
    }
}


const getCars = async () => {
    const carModelIDTD = document.querySelector('.carModelID');
    const id = carModelIDTD.innerText;
    try {
        const api = `/cars/getAvailableCars/${id}`;
        const result = await axios.get(api);
        const cars = result.data.cars;
        console.log(cars)
        return cars;
    } catch (e) {
        console.log(e)
    }
};

const initialize = async () => {

    cars = await getCars();
    if(cars.length===0){
        return;
    }
    maxCarIndex = cars.length - 1;

     color=document.querySelector('.color');
     needsRepair=document.querySelector('.needsRepair');
     condition=document.querySelector('.condition');
     image= document.querySelector('.carImage');
    const rentBtn = document.createElement('button');
    rentBtn.classList.add('btn');
    rentBtn.classList.add('btn-warning');
    rentBtn.classList.add('start-50');

    rentBtn.innerText = "Rent";

    rentBtn.addEventListener('click', async () => {
        const rentString = `/cars/rent/${cars[currentCarIndex].CarID}`;
        rentBtn.id="disabledBtn"
            rentBtn.setAttribute('disabled',true);
            setTimeout(()=>{
                // rentBtn.classList.remove('disabledBtn');
                // rentBtn.classList.remove('btn-disabled');
            },3000)
            try {
                const res = await axios.get(rentString);
                const mesg= res.data;
                rentBtn.id=""
                rentBtn.removeAttribute('disabled',true);
            if(mesg === 'not loggedIn'){
                alert('you need to login first');
            }else if(mesg === 'cant rent any more cars'){
                alert('you have reached the maximum number of cars you can rent');
            }else{
                location.reload();
            }
        } catch (e) { console.log(e) }
    })
    const buttonContainer = document.querySelector('.buttonContainer');

    const nextBtn = document.querySelector('.nextButton')
    
    const prevBtn = document.querySelector('.prevButton')

    prevBtn.addEventListener('click', showPrevCar);
    nextBtn.addEventListener('click', showNextCar);
    // let insertedNode = parentNode.insertBefore(newNode, referenceNode)
    document.querySelector('.hide').insertBefore(rentBtn,buttonContainer);
    // document.querySelector('body').appendChild(rentBtn);

    showCar(0);
}
initialize()
// getCars();
let i=0;
const show = ()=>{
    const showButton = document.querySelector('.showCars');
    showButton.addEventListener('click',()=>{
        if(cars.length===0){
            alert('no available cars to show');
            return;
        }
        if(i%2 == 0){
        document.querySelector('.hide').style.display = "";
        showButton.innerText='Hide Cars'}
        else{

            showButton.innerText='Show Cars'
        document.querySelector('.hide').style.display = "none";

        }
        i++;
    })
}
show();