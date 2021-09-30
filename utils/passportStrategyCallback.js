const dbFunctions = require('../utils/dbFunctions');
module.exports=async function(username,password,done){
    const user=await dbFunctions.checkLogin(username,password);
  try{
      console.log(user);
      if(user===null){
          return done(null,false);
      }else{
          console.log('loggedin')
      return done(null,user)}
  }catch(e){
      console.log(e)
      return done(e,false)
  }}