function responseReturn(res,status,sucess,data){
    res.status(status).send( {
        sucess: sucess,
        data: data
      });
}
module.exports={
    responseReturn:responseReturn,
}