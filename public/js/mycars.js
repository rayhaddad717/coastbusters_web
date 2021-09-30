const returnBtn = document.querySelector('.returnCarBtn');
returnBtn.addEventListener('click',async()=>{
    const ID= returnBtn.id;
    console.log(ID);
    const url= `/cars/return/${ID}`
    const res=await axios.delete(url);
    console.log(res);
    location.reload();
})